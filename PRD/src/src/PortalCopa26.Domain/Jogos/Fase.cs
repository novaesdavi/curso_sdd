namespace PortalCopa26.Domain.Jogos;

/// <summary>
/// Uma das 7 etapas do torneio. A partir de <see cref="SegundaFase"/> o confronto
/// pode depender do resultado de outro jogo (ver <see cref="ReferenciaJogo"/>).
/// </summary>
public enum Fase
{
    Grupos,
    SegundaFase,
    Oitavas,
    Quartas,
    Semifinal,
    TerceiroLugar,
    Final,
}
