using PortalCopa26.Domain.Jogos;
using PortalCopa26.Domain.Selecoes;

namespace PortalCopa26.Domain.ClassificacaoGrupos;

/// <summary>
/// Motor de classificação dos grupos. Tradução de <c>classificacao.js</c>
/// (funções <c>linhaVazia</c>, <c>aplicar</c>, <c>compararBase</c>, <c>miniTabela</c>,
/// <c>ordenarGrupo</c>, <c>calcularGrupo</c>, <c>terceirosColocados</c> e <c>zona</c>)
/// — a lógica não foi reinventada, só traduzida para C#.
/// </summary>
public static class Classificacao
{
    public const int PontosVitoria = 3;
    public const int PontosEmpate = 1;
    public const int VagasTerceiros = 8;

    /// <summary>
    /// Calcula a tabela de um grupo a partir das seleções que o compõem e dos seus
    /// jogos. Um jogo sem placar completo não conta para nenhuma seleção.
    /// </summary>
    public static TabelaGrupo CalcularGrupo(
        string grupo,
        IReadOnlyCollection<Selecao> selecoesDoGrupo,
        IReadOnlyCollection<Jogo> jogosDoGrupo)
    {
        if (string.IsNullOrWhiteSpace(grupo))
            throw new DomainException("É preciso informar o grupo para calcular a tabela.");
        if (selecoesDoGrupo is null || selecoesDoGrupo.Count == 0)
            throw new DomainException("É preciso informar as seleções do grupo para calcular a tabela.");
        foreach (var jogo in jogosDoGrupo)
        {
            if (jogo.Fase != Fase.Grupos || jogo.Grupo != grupo)
                throw new DomainException($"O jogo {jogo.Id} não pertence à fase de grupos do grupo {grupo}.");
        }

        var linhas = selecoesDoGrupo.ToDictionary(s => s.Cod, s => new LinhaClassificacao(s));

        var computados = 0;
        foreach (var jogo in jogosDoGrupo)
        {
            if (!jogo.PlacarDefinido) continue;

            var golsMandante = jogo.PlacarMandante!.Value;
            var golsVisitante = jogo.PlacarVisitante!.Value;
            linhas[jogo.Mandante!].RegistrarResultado(golsMandante, golsVisitante);
            linhas[jogo.Visitante!].RegistrarResultado(golsVisitante, golsMandante);
            computados += 1;
        }

        var ordenadas = OrdenarGrupo(linhas.Values.ToList(), jogosDoGrupo);
        return new TabelaGrupo(grupo, ordenadas, computados, jogosDoGrupo.Count);
    }

    /// <summary>Critérios 1 a 3 da RN-01: pontos, saldo de gols, gols marcados.</summary>
    private static int CompararBase(LinhaClassificacao a, LinhaClassificacao b)
    {
        var porPontos = b.Pontos - a.Pontos;
        if (porPontos != 0) return porPontos;
        var porSaldo = b.SaldoDeGols - a.SaldoDeGols;
        if (porSaldo != 0) return porSaldo;
        return b.GolsPro - a.GolsPro;
    }

    /// <summary>
    /// Ordena as linhas de um grupo aplicando a RN-01 na ordem exata, registrando
    /// qual critério separou cada bloco de seleções empatadas.
    /// </summary>
    private static List<LinhaClassificacao> OrdenarGrupo(List<LinhaClassificacao> linhas, IReadOnlyCollection<Jogo> jogosDoGrupo)
    {
        linhas.Sort(CompararBase);
        var resultado = new List<LinhaClassificacao>(linhas.Count);

        var i = 0;
        while (i < linhas.Count)
        {
            var fim = i + 1;
            while (fim < linhas.Count && CompararBase(linhas[i], linhas[fim]) == 0) fim += 1;

            var bloco = linhas.GetRange(i, fim - i);
            if (bloco.Count == 1)
            {
                resultado.Add(bloco[0]);
            }
            else
            {
                var mini = MiniTabela(bloco.Select(l => l.Cod), jogosDoGrupo);
                bloco.Sort((a, b) =>
                {
                    // 4. resultado do confronto direto  5. saldo nos confrontos diretos
                    var porConfronto = CompararMiniTabela(mini[a.Cod], mini[b.Cod]);
                    if (porConfronto != 0) return porConfronto;
                    // 6. Fair Play — sem dados nas fontes. 7. Ranking FIFA.
                    return a.RankingOrdem - b.RankingOrdem;
                });

                for (var k = 1; k < bloco.Count; k += 1)
                {
                    var anterior = bloco[k - 1];
                    var separadoPorConfronto = CompararMiniTabela(mini[anterior.Cod], mini[bloco[k].Cod]) != 0;
                    bloco[k].CriterioDesempate = separadoPorConfronto ? "confronto direto" : "ranking FIFA";
                    anterior.CriterioDesempate ??= bloco[k].CriterioDesempate;
                }

                resultado.AddRange(bloco);
            }

            i = fim;
        }

        for (var idx = 0; idx < resultado.Count; idx += 1) resultado[idx].Posicao = idx + 1;
        return resultado;
    }

    private readonly record struct LinhaMiniTabela(int Pontos, int GolsPro, int GolsContra)
    {
        public int SaldoDeGols => GolsPro - GolsContra;
    }

    private static int CompararMiniTabela(LinhaMiniTabela a, LinhaMiniTabela b)
    {
        var porPontos = b.Pontos - a.Pontos;
        if (porPontos != 0) return porPontos;
        var porSaldo = b.SaldoDeGols - a.SaldoDeGols;
        if (porSaldo != 0) return porSaldo;
        return b.GolsPro - a.GolsPro;
    }

    /// <summary>
    /// Mini-tabela dos confrontos diretos entre as seleções empatadas (critérios 4 e
    /// 5 da RN-01).
    /// </summary>
    private static Dictionary<string, LinhaMiniTabela> MiniTabela(IEnumerable<string> codigos, IReadOnlyCollection<Jogo> jogosDoGrupo)
    {
        var codigosDoBloco = codigos.ToHashSet();
        var mapa = codigosDoBloco.ToDictionary(c => c, _ => new LinhaMiniTabela(0, 0, 0));

        foreach (var jogo in jogosDoGrupo)
        {
            if (jogo.Mandante is null || jogo.Visitante is null) continue;
            if (!codigosDoBloco.Contains(jogo.Mandante) || !codigosDoBloco.Contains(jogo.Visitante)) continue;
            if (!jogo.PlacarDefinido) continue;

            var gm = jogo.PlacarMandante!.Value;
            var gv = jogo.PlacarVisitante!.Value;

            var m = mapa[jogo.Mandante];
            var v = mapa[jogo.Visitante];
            m = m with { GolsPro = m.GolsPro + gm, GolsContra = m.GolsContra + gv };
            v = v with { GolsPro = v.GolsPro + gv, GolsContra = v.GolsContra + gm };

            if (gm > gv) m = m with { Pontos = m.Pontos + PontosVitoria };
            else if (gm < gv) v = v with { Pontos = v.Pontos + PontosVitoria };
            else
            {
                m = m with { Pontos = m.Pontos + PontosEmpate };
                v = v with { Pontos = v.Pontos + PontosEmpate };
            }

            mapa[jogo.Mandante] = m;
            mapa[jogo.Visitante] = v;
        }

        return mapa;
    }

    /// <summary>
    /// Ordena os terceiros colocados dos 12 grupos e marca os 8 melhores como
    /// classificados ao mata-mata (RN-02).
    /// </summary>
    public static IReadOnlyList<LinhaTerceiro> OrdenarTerceiros(IReadOnlyDictionary<string, TabelaGrupo> tabelasPorGrupo)
    {
        if (tabelasPorGrupo is null || tabelasPorGrupo.Count == 0)
            throw new DomainException("É preciso informar as tabelas dos grupos para ordenar os terceiros colocados.");

        var terceiros = tabelasPorGrupo
            .OrderBy(kv => kv.Key, StringComparer.Ordinal)
            .Where(kv => kv.Value.Linhas.Count >= 3)
            .Select(kv => new LinhaTerceiro(kv.Value.Linhas[2], kv.Key))
            .ToList();

        terceiros.Sort((a, b) =>
        {
            // Pontos > Saldo de gols > Gols marcados > (Fair play: sem dados) > Ranking FIFA
            var porPontos = b.Linha.Pontos - a.Linha.Pontos;
            if (porPontos != 0) return porPontos;
            var porSaldo = b.Linha.SaldoDeGols - a.Linha.SaldoDeGols;
            if (porSaldo != 0) return porSaldo;
            var porGols = b.Linha.GolsPro - a.Linha.GolsPro;
            if (porGols != 0) return porGols;
            return a.Linha.RankingOrdem - b.Linha.RankingOrdem;
        });

        for (var i = 0; i < terceiros.Count; i += 1)
        {
            terceiros[i].PosicaoEntreTerceiros = i + 1;
            terceiros[i].Avanca = i < VagasTerceiros;
        }

        return terceiros;
    }

    /// <summary>
    /// Zona de classificação de uma seleção do grupo. Sem o grupo completo, a zona é
    /// sempre indefinida. Com o grupo completo, 1º/2º são sempre classificados e o
    /// 4º é sempre eliminado; o 3º depende de estar entre os 8 melhores terceiros
    /// (<paramref name="terceiros"/>) — sem essa informação, também fica indefinido.
    /// </summary>
    public static ZonaClassificacao ZonaDe(TabelaGrupo tabela, LinhaClassificacao linha, IReadOnlyList<LinhaTerceiro>? terceiros = null)
    {
        if (!tabela.Completo) return ZonaClassificacao.Indefinido;
        if (linha.Posicao is 1 or 2) return ZonaClassificacao.Classificado;
        if (linha.Posicao == 4) return ZonaClassificacao.Eliminado;

        if (terceiros is null) return ZonaClassificacao.Indefinido;
        var terceiro = terceiros.FirstOrDefault(t => t.Cod == linha.Cod);
        return terceiro is { Avanca: true } ? ZonaClassificacao.Classificado : ZonaClassificacao.Eliminado;
    }
}
