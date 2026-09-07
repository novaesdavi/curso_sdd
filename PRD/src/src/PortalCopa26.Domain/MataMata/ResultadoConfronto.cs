namespace PortalCopa26.Domain.MataMata;

/// <summary>
/// O resultado resolvido de um confronto do mata-mata: quem joga, o placar e — se
/// já decidido — quem avança. Equivalente ao objeto que <c>resolverMataMata</c>
/// associa a cada jogo em <c>classificacao.js</c>.
/// </summary>
public sealed class ResultadoConfronto
{
    public string JogoId { get; }

    /// <summary>Nulo enquanto o jogo de origem (por referência) não for decidido.</summary>
    public string? Mandante { get; }
    public string? Visitante { get; }
    public int? GolsMandante { get; }
    public int? GolsVisitante { get; }
    public string? Vencedor { get; }
    public string? Perdedor { get; }

    /// <summary>Verdadeiro quando já se sabe quem avança — por placar ou por pênaltis.</summary>
    public bool Decidido { get; }

    /// <summary>Verdadeiro quando o vencedor só foi definido nos pênaltis (RN-03).</summary>
    public bool DecididoNosPenaltis { get; }

    /// <summary>Verdadeiro quando o tempo normal terminou empatado (decidido ou não).</summary>
    public bool Empatado { get; }

    internal ResultadoConfronto(
        string jogoId,
        string? mandante,
        string? visitante,
        int? golsMandante,
        int? golsVisitante,
        string? vencedor,
        string? perdedor,
        bool decidido,
        bool decididoNosPenaltis,
        bool empatado)
    {
        JogoId = jogoId;
        Mandante = mandante;
        Visitante = visitante;
        GolsMandante = golsMandante;
        GolsVisitante = golsVisitante;
        Vencedor = vencedor;
        Perdedor = perdedor;
        Decidido = decidido;
        DecididoNosPenaltis = decididoNosPenaltis;
        Empatado = empatado;
    }
}
