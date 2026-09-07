using FluentAssertions;
using PortalCopa26.Domain.ClassificacaoGrupos;
using PortalCopa26.Domain.Jogos;
using PortalCopa26.Domain.Selecoes;

namespace PortalCopa26.Domain.Tests.ClassificacaoGrupos;

/// <summary>
/// Gabarito de <c>tools/testar.mjs</c> (RN-02) com uma classificação completa de 12
/// grupos sintéticos de 4 seleções, gerada com o mesmo padrão determinístico de
/// placares do teste original ("os 8 melhores terceiros").
/// </summary>
public class TerceirosColocadosTests
{
    private static (IReadOnlyDictionary<string, TabelaGrupo> Tabelas, List<Selecao> Selecoes) CriarClassificacaoDe12Grupos()
    {
        const string grupos = "ABCDEFGHIJKL";
        var tabelas = new Dictionary<string, TabelaGrupo>();
        var todasSelecoes = new List<Selecao>();
        var rankingGlobal = 1;
        var n = 0;

        foreach (var letraGrupo in grupos)
        {
            var grupo = letraGrupo.ToString();
            var codigos = new[] { grupo + "AA", grupo + "AB", grupo + "AC", grupo + "AD" };
            var selecoesDoGrupo = codigos
                .Select((cod, i) => new Selecao(cod, cod, grupo, i + 1, i == 0, rankingGlobal++))
                .ToList();
            todasSelecoes.AddRange(selecoesDoGrupo);

            var jogosDoGrupo = new List<Jogo>();
            var numero = 0;
            for (var i = 0; i < codigos.Length; i += 1)
            for (var j = i + 1; j < codigos.Length; j += 1)
            {
                numero += 1;
                var jogo = new Jogo($"{grupo}{numero}", Fase.Grupos, grupo, codigos[i], null, codigos[j], null);
                jogo.RegistrarPlacar(n % 4, (n + 1) % 3);
                n += 1;
                jogosDoGrupo.Add(jogo);
            }

            tabelas[grupo] = Classificacao.CalcularGrupo(grupo, selecoesDoGrupo, jogosDoGrupo);
        }

        return (tabelas, todasSelecoes);
    }

    [Fact(DisplayName = "RN-02: 24 diretos (1º e 2º de cada grupo) + 8 melhores terceiros somam 32 classificados, sem repetição")]
    public void VinteQuatroDiretosMaisOitoTerceirosSomamTrintaEDois()
    {
        var (tabelas, _) = CriarClassificacaoDe12Grupos();

        var primeiros = tabelas.Values.Select(t => t.Linhas[0].Cod).ToList();
        var segundos = tabelas.Values.Select(t => t.Linhas[1].Cod).ToList();
        var terceiros = Classificacao.OrdenarTerceiros(tabelas);
        var terceirosQueAvancam = terceiros.Where(t => t.Avanca).Select(t => t.Cod).ToList();

        primeiros.Should().HaveCount(12);
        segundos.Should().HaveCount(12);
        terceiros.Should().HaveCount(12);
        terceirosQueAvancam.Should().HaveCount(8);

        var todosClassificados = primeiros.Concat(segundos).Concat(terceirosQueAvancam).ToList();
        todosClassificados.Should().HaveCount(32);
        todosClassificados.Distinct().Should().HaveCount(32, "nenhuma seleção pode ser classificada duas vezes");
    }

    [Fact(DisplayName = "RN-02: os 12 terceiros ficam ordenados por pontos, saldo de gols, gols marcados e ranking FIFA")]
    public void TerceirosOrdenadosPorPontosSaldoGolsERanking()
    {
        var (tabelas, _) = CriarClassificacaoDe12Grupos();

        var terceiros = Classificacao.OrdenarTerceiros(tabelas);

        for (var i = 1; i < terceiros.Count; i += 1)
        {
            var anterior = terceiros[i - 1].Linha;
            var atual = terceiros[i].Linha;
            var ordenado = anterior.Pontos > atual.Pontos
                || (anterior.Pontos == atual.Pontos && anterior.SaldoDeGols > atual.SaldoDeGols)
                || (anterior.Pontos == atual.Pontos && anterior.SaldoDeGols == atual.SaldoDeGols && anterior.GolsPro > atual.GolsPro)
                || (anterior.Pontos == atual.Pontos && anterior.SaldoDeGols == atual.SaldoDeGols && anterior.GolsPro == atual.GolsPro && anterior.RankingOrdem <= atual.RankingOrdem);

            ordenado.Should().BeTrue($"a ordem entre {anterior.Cod} e {atual.Cod} deveria respeitar pontos > saldo > gols > ranking FIFA");
        }
    }

    [Fact(DisplayName = "RN-02: terceiro colocado avança se e só se está entre os 8 melhores dos 12")]
    public void TerceiroAvancaSomenteEntreOsOitoMelhores()
    {
        var (tabelas, _) = CriarClassificacaoDe12Grupos();

        var terceiros = Classificacao.OrdenarTerceiros(tabelas);

        terceiros.Where(t => t.PosicaoEntreTerceiros <= Classificacao.VagasTerceiros)
            .Should().OnlyContain(t => t.Avanca);
        terceiros.Where(t => t.PosicaoEntreTerceiros > Classificacao.VagasTerceiros)
            .Should().OnlyContain(t => !t.Avanca);
    }

    [Fact(DisplayName = "Zona: o 3º colocado é classificado ou eliminado conforme estar ou não entre os 8 melhores terceiros")]
    public void ZonaDoTerceiroDependeDosOitoMelhores()
    {
        var (tabelas, _) = CriarClassificacaoDe12Grupos();
        var terceiros = Classificacao.OrdenarTerceiros(tabelas);

        var terceiroQueAvanca = terceiros.First(t => t.Avanca);
        var tabelaQueAvanca = tabelas[terceiroQueAvanca.Grupo];
        Classificacao.ZonaDe(tabelaQueAvanca, terceiroQueAvanca.Linha, terceiros).Should().Be(ZonaClassificacao.Classificado);

        var terceiroEliminado = terceiros.First(t => !t.Avanca);
        var tabelaEliminada = tabelas[terceiroEliminado.Grupo];
        Classificacao.ZonaDe(tabelaEliminada, terceiroEliminado.Linha, terceiros).Should().Be(ZonaClassificacao.Eliminado);
    }
}
