using PortalCopa26.Domain.Selecoes;

namespace PortalCopa26.Domain.ClassificacaoGrupos;

/// <summary>
/// A linha de uma seleção na tabela de classificação de um grupo. Equivalente ao
/// objeto produzido por <c>linhaVazia</c>/<c>aplicar</c> em <c>classificacao.js</c>.
/// </summary>
public sealed class LinhaClassificacao
{
    public string Cod { get; }
    public string Nome { get; }
    public string Grupo { get; }
    public bool CabecaDeChave { get; }
    public int? RankingPosicao { get; }
    public int RankingOrdem { get; }

    public int Jogos { get; private set; }
    public int Vitorias { get; private set; }
    public int Empates { get; private set; }
    public int Derrotas { get; private set; }
    public int GolsPro { get; private set; }
    public int GolsContra { get; private set; }
    public int SaldoDeGols => GolsPro - GolsContra;
    public int Pontos { get; private set; }

    /// <summary>Posição na tabela já ordenada (1-based). Zero até a ordenação ocorrer.</summary>
    public int Posicao { get; internal set; }

    /// <summary>
    /// Qual critério da RN-01 separou esta seleção da imediatamente acima na tabela:
    /// "confronto direto" ou "ranking FIFA". Nulo quando não houve empate a desfazer
    /// com a linha anterior.
    /// </summary>
    public string? CriterioDesempate { get; internal set; }

    internal LinhaClassificacao(Selecao selecao)
    {
        Cod = selecao.Cod;
        Nome = selecao.Nome;
        Grupo = selecao.Grupo;
        CabecaDeChave = selecao.CabecaDeChave;
        RankingPosicao = selecao.RankingPosicao;
        RankingOrdem = selecao.RankingOrdem;
    }

    /// <summary>Contabiliza um jogo já disputado por esta seleção.</summary>
    internal void RegistrarResultado(int golsPro, int golsContra)
    {
        Jogos += 1;
        GolsPro += golsPro;
        GolsContra += golsContra;

        if (golsPro > golsContra)
        {
            Vitorias += 1;
            Pontos += Classificacao.PontosVitoria;
        }
        else if (golsPro < golsContra)
        {
            Derrotas += 1;
        }
        else
        {
            Empates += 1;
            Pontos += Classificacao.PontosEmpate;
        }
    }
}
