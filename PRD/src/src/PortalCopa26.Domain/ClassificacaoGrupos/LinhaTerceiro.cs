namespace PortalCopa26.Domain.ClassificacaoGrupos;

/// <summary>
/// Um terceiro colocado, no contexto da comparação entre os 12 terceiros dos
/// grupos (RN-02). Equivalente ao objeto retornado por <c>terceirosColocados</c>
/// em <c>classificacao.js</c>.
/// </summary>
public sealed class LinhaTerceiro
{
    public LinhaClassificacao Linha { get; }
    public string Grupo { get; }
    public string Cod => Linha.Cod;

    /// <summary>Posição entre os 12 terceiros (1-based), do melhor ao pior.</summary>
    public int PosicaoEntreTerceiros { get; internal set; }

    /// <summary>Verdadeiro para os 8 melhores — os que avançam ao mata-mata.</summary>
    public bool Avanca { get; internal set; }

    internal LinhaTerceiro(LinhaClassificacao linha, string grupo)
    {
        Linha = linha;
        Grupo = grupo;
    }
}
