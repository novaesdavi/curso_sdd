namespace PortalCopa26.Domain.ClassificacaoGrupos;

/// <summary>
/// Situação de uma seleção quanto ao avanço quando o grupo está completo, ela é
/// classificada (1º/2º, ou 3º entre os 8 melhores terceiros) ou eliminada (4º, ou
/// 3º fora dos 8 melhores). Enquanto o grupo não está completo, a zona é indefinida.
/// </summary>
public enum ZonaClassificacao
{
    Indefinido,
    Classificado,
    Eliminado,
}
