import React from 'react';

const backendContent = `
# Arquitetura do Backend (ASP.NET Core 8 - Clean Architecture)

Esta seção contém o código-fonte necessário para criar o backend que alimentaria este frontend em um ambiente de produção.

## 1. Estrutura da Solução

\`\`\`
/src
  /Domain          (Entidades e Interfaces do Core)
  /Application     (Casos de Uso, DTOs, Services)
  /Infrastructure  (EF Core, SQL Server, Repositories)
  /API             (Controllers, SignalR Hubs)
\`\`\`

## 2. Domain Layer (Entidades)

**Ticket.cs**
\`\`\`csharp
public class Ticket : BaseEntity
{
    public string Code { get; private set; }
    public TicketPriority Priority { get; private set; }
    public TicketStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? CalledAt { get; private set; }
    public DateTime? FinishedAt { get; private set; }
    
    public Guid SectorId { get; private set; }
    public virtual Sector Sector { get; private set; }
    
    public Guid? CounterId { get; private set; }
    
    // Construtores e métodos de domínio...
}

public enum TicketStatus { Generated, Calling, InService, Finished, Canceled }
\`\`\`

## 3. Infrastructure Layer (EF Core)

**AppDbContext.cs**
\`\`\`csharp
public class AppDbContext : DbContext 
{
    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<Sector> Sectors { get; set; }
    public DbSet<Counter> Counters { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<Ticket>()
            .HasIndex(t => t.Status);
        // Configurações fluent API...
    }
}
\`\`\`

## 4. Application Service (Lógica da Fila)

**QueueService.cs**
\`\`\`csharp
public class QueueService : IQueueService
{
    private readonly IRepository<Ticket> _ticketRepo;
    private readonly IHubContext<QueueHub> _hub; // SignalR

    public async Task<TicketDto> GenerateTicketAsync(CreateTicketCommand cmd)
    {
        var sector = await _sectorRepo.GetByIdAsync(cmd.SectorId);
        var todayCount = await _ticketRepo.CountTodayAsync(cmd.SectorId);
        
        var code = $"{sector.Prefix}-{(todayCount + 1):D3}";
        
        var ticket = new Ticket(code, cmd.Priority, cmd.SectorId);
        await _ticketRepo.AddAsync(ticket);
        
        // Notifica o admin que entrou nova senha
        await _hub.Clients.Group("Admin").SendAsync("NewTicket", ticket);
        
        return _mapper.Map<TicketDto>(ticket);
    }

    public async Task<TicketDto?> CallNextAsync(Guid sectorId, int counterNumber)
    {
        // Regra de Negócio: Preferencial primeiro, depois por ordem de chegada
        var pendingTickets = await _ticketRepo.GetPendingBySector(sectorId);
        
        var next = pendingTickets
            .OrderByDescending(t => t.Priority == TicketPriority.Preferencial)
            .ThenBy(t => t.CreatedAt)
            .FirstOrDefault();

        if (next == null) return null;

        next.SetCalling(counterNumber);
        await _ticketRepo.UpdateAsync(next);

        // SignalR: Notifica o Painel de TV
        await _hub.Clients.All.SendAsync("TicketCalled", new { 
            Code = next.Code, 
            Counter = counterNumber, 
            Sector = next.Sector.Name 
        });

        return _mapper.Map<TicketDto>(next);
    }
}
\`\`\`

## 5. API Controller

**TicketsController.cs**
\`\`\`csharp
[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly IQueueService _queueService;

    [HttpPost]
    public async Task<IActionResult> Generate([FromBody] CreateTicketCommand cmd)
    {
        var ticket = await _queueService.GenerateTicketAsync(cmd);
        return Ok(ticket);
    }

    [HttpPost("call")]
    [Authorize(Roles = "Attendant")]
    public async Task<IActionResult> CallNext([FromBody] CallNextCommand cmd)
    {
        var ticket = await _queueService.CallNextAsync(cmd.SectorId, cmd.CounterNumber);
        if (ticket == null) return NotFound("Fila vazia");
        return Ok(ticket);
    }
}
\`\`\`

## 6. SignalR Setup (Program.cs)

\`\`\`csharp
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddSignalR();
builder.Services.AddDbContext<AppDbContext>(options => 
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

// Map Hub
app.MapHub<QueueHub>("/hubs/queue");
app.MapControllers();
app.Run();
\`\`\`
`;

export default function BackendGuide() {
  return (
    <div className="max-w-5xl mx-auto p-8 bg-white min-h-screen shadow-sm">
      <div className="prose prose-blue max-w-none">
        <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-6 rounded-lg border border-gray-200 text-gray-800">
          {backendContent}
        </pre>
      </div>
    </div>
  );
}