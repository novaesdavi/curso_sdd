namespace PortalCopa26.Domain.Jogos;

/// <summary>
/// Uma partida do torneio (das 104). Nunca "Match".
///
/// Cada lado (mandante/visitante) é conhecido de uma de duas formas: um código de
/// <see cref="Selecoes.Selecao"/> já definido, ou uma <see cref="ReferenciaJogo"/>
/// que aponta para o vencedor/perdedor de outro jogo — como o protótipo resolve o
/// chaveamento a partir das oitavas (ver <c>mandanteRef</c>/<c>visitanteRef</c> em
/// <c>classificacao.js</c>).
/// </summary>
public sealed class Jogo
{
    public string Id { get; }
    public Fase Fase { get; }

    /// <summary>Nula fora da fase de grupos.</summary>
    public string? Grupo { get; }

    public string? Mandante { get; }
    public ReferenciaJogo? MandanteRef { get; }
    public string? Visitante { get; }
    public ReferenciaJogo? VisitanteRef { get; }

    public int? PlacarMandante { get; private set; }
    public int? PlacarVisitante { get; private set; }
    public int? PenaltisMandante { get; private set; }
    public int? PenaltisVisitante { get; private set; }

    public Jogo(
        string id,
        Fase fase,
        string? grupo,
        string? mandante,
        ReferenciaJogo? mandanteRef,
        string? visitante,
        ReferenciaJogo? visitanteRef)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new DomainException("O identificador de um jogo não pode ser vazio.");

        if (fase == Fase.Grupos)
        {
            if (string.IsNullOrWhiteSpace(grupo))
                throw new DomainException("Um jogo da fase de grupos precisa informar o grupo.");
            if (mandanteRef is not null || visitanteRef is not null)
                throw new DomainException("Um jogo da fase de grupos não depende de referência a outro jogo.");
        }
        else if (grupo is not null)
        {
            throw new DomainException("Só um jogo da fase de grupos pode ter grupo definido.");
        }

        if (!ExatamenteUm(mandante, mandanteRef))
            throw new DomainException("O mandante de um jogo deve vir de um código de seleção ou de uma referência, nunca dos dois nem de nenhum.");
        if (!ExatamenteUm(visitante, visitanteRef))
            throw new DomainException("O visitante de um jogo deve vir de um código de seleção ou de uma referência, nunca dos dois nem de nenhum.");

        Id = id;
        Fase = fase;
        Grupo = grupo;
        Mandante = mandante;
        MandanteRef = mandanteRef;
        Visitante = visitante;
        VisitanteRef = visitanteRef;
    }

    private static bool ExatamenteUm(string? codigo, ReferenciaJogo? referencia) =>
        (codigo is not null) ^ (referencia is not null);

    public bool PlacarDefinido => PlacarMandante.HasValue && PlacarVisitante.HasValue;

    public bool EmpatadoNoTempoNormal =>
        PlacarDefinido && PlacarMandante!.Value == PlacarVisitante!.Value;

    public bool PenaltisDefinidos => PenaltisMandante.HasValue && PenaltisVisitante.HasValue;

    public StatusJogo Status
    {
        get
        {
            if (!PlacarDefinido) return StatusJogo.Agendado;
            if (!EmpatadoNoTempoNormal) return StatusJogo.Encerrado;
            return PenaltisDefinidos ? StatusJogo.Encerrado : StatusJogo.EmAndamento;
        }
    }

    /// <summary>Registra o placar do tempo normal.</summary>
    public void RegistrarPlacar(int golsMandante, int golsVisitante)
    {
        if (golsMandante < 0 || golsVisitante < 0)
            throw new DomainException("O placar de um jogo não pode ser negativo.");

        PlacarMandante = golsMandante;
        PlacarVisitante = golsVisitante;

        if (!EmpatadoNoTempoNormal)
        {
            PenaltisMandante = null;
            PenaltisVisitante = null;
        }
    }

    /// <summary>
    /// Registra a decisão por pênaltis (RN-03). Só é possível quando o tempo normal
    /// termina empatado — não existe gol de ouro nem gol de prata.
    /// </summary>
    public void RegistrarPenaltis(int penaltisMandante, int penaltisVisitante)
    {
        if (!EmpatadoNoTempoNormal)
            throw new DomainException("Só é possível registrar pênaltis quando o jogo termina empatado no tempo normal.");
        if (penaltisMandante < 0 || penaltisVisitante < 0)
            throw new DomainException("O placar de pênaltis não pode ser negativo.");
        if (penaltisMandante == penaltisVisitante)
            throw new DomainException("A decisão por pênaltis não pode terminar empatada.");

        PenaltisMandante = penaltisMandante;
        PenaltisVisitante = penaltisVisitante;
    }
}
