namespace PortalCopa26.Domain.Jogos;

/// <summary>
/// Como o mata-mata resolve um lado de um jogo quando ele ainda não está definido:
/// aponta para o vencedor (ou perdedor) de outro jogo, equivalente a
/// <c>mandanteRef</c>/<c>visitanteRef</c> no protótipo.
/// </summary>
public sealed record ReferenciaJogo(string JogoId, TipoReferencia Tipo);
