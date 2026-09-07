namespace PortalCopa26.Domain.ClassificacaoGrupos;

/// <summary>
/// A tabela de classificação calculada de um grupo, com a posição de cada seleção
/// já resolvida pela RN-01.
/// </summary>
public sealed class TabelaGrupo
{
    public string Grupo { get; }
    public IReadOnlyList<LinhaClassificacao> Linhas { get; }
    public int JogosComputados { get; }
    public int TotalJogos { get; }

    /// <summary>Verdadeiro quando todos os jogos do grupo já têm placar definido.</summary>
    public bool Completo => JogosComputados == TotalJogos;

    internal TabelaGrupo(string grupo, IReadOnlyList<LinhaClassificacao> linhas, int jogosComputados, int totalJogos)
    {
        Grupo = grupo;
        Linhas = linhas;
        JogosComputados = jogosComputados;
        TotalJogos = totalJogos;
    }
}
