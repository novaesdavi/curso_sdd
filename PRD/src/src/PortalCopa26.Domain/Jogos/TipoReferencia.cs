namespace PortalCopa26.Domain.Jogos;

/// <summary>
/// Qual lado do jogo de origem alimenta o próximo confronto: o vencedor (regra geral
/// do mata-mata) ou o perdedor (caso da disputa de 3º lugar).
/// </summary>
public enum TipoReferencia
{
    Vencedor,
    Perdedor,
}
