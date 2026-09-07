using FluentAssertions;
using PortalCopa26.Domain.ClassificacaoGrupos;
using PortalCopa26.Domain.Jogos;
using PortalCopa26.Domain.Selecoes;

namespace PortalCopa26.Domain.Tests.ClassificacaoGrupos;

/// <summary>
/// Gabarito de <c>tools/testar.mjs</c> (RN-01) traduzido para fixtures mínimas, como
/// descrito em <c>design.md</c>. Os testes de seed do protótipo (48 seleções, 104
/// jogos, elenco/técnico, estádio/horário) não têm equivalente aqui: dependem do
/// dataset real, fora do escopo desta change (ver proposal.md - Non-Goals) — serão
/// cobertos quando o Seed do EF Core existir em <c>PortalCopa26.Infrastructure</c>.
/// </summary>
public class ClassificacaoTests
{
    private static Selecao Time(string cod, string grupo, int pote, bool cabecaDeChave = false, int? ranking = null) =>
        new(cod, cod, grupo, pote, cabecaDeChave, ranking);

    /// <summary>Round-robin dos 4 times de um grupo (6 jogos), sem placar ainda.</summary>
    private static List<Jogo> RodizioDoGrupo(string grupo, params string[] codigos)
    {
        var jogos = new List<Jogo>();
        var numero = 0;
        for (var i = 0; i < codigos.Length; i += 1)
        for (var j = i + 1; j < codigos.Length; j += 1)
        {
            numero += 1;
            jogos.Add(new Jogo($"{grupo}{numero}", Fase.Grupos, grupo, codigos[i], null, codigos[j], null));
        }

        return jogos;
    }

    [Fact(DisplayName = "Grupo com todos os jogos disputados soma os pontos corretamente (RN-01)")]
    public void GrupoCompletoSomaPontosCorretamente()
    {
        var selecoes = new[] { Time("AAA", "A", 1), Time("BBB", "A", 2), Time("CCC", "A", 3), Time("DDD", "A", 4) };
        var jogos = RodizioDoGrupo("A", "AAA", "BBB", "CCC", "DDD");

        var n = 0;
        foreach (var jogo in jogos)
        {
            jogo.RegistrarPlacar(n % 4, (n + 1) % 3);
            n += 1;
        }

        var tabela = Classificacao.CalcularGrupo("A", selecoes, jogos);

        tabela.Completo.Should().BeTrue();
        tabela.Linhas.Should().AllSatisfy(l => l.Jogos.Should().Be(3));

        var decididos = jogos.Count(j => j.PlacarMandante != j.PlacarVisitante);
        var empatados = jogos.Count - decididos;
        tabela.Linhas.Sum(l => l.Pontos).Should().Be(3 * decididos + 2 * empatados);
    }

    [Fact(DisplayName = "Grupo parcialmente disputado reflete somente os jogos com placar definido")]
    public void GrupoParcialRefleteSomenteJogosComPlacar()
    {
        var selecoes = new[] { Time("AAA", "A", 1), Time("BBB", "A", 2), Time("CCC", "A", 3), Time("DDD", "A", 4) };
        var jogos = RodizioDoGrupo("A", "AAA", "BBB", "CCC", "DDD");

        jogos[0].RegistrarPlacar(2, 1); // AAA x BBB

        var tabela = Classificacao.CalcularGrupo("A", selecoes, jogos);

        tabela.JogosComputados.Should().Be(1);
        tabela.TotalJogos.Should().Be(6);
        tabela.Completo.Should().BeFalse();
        tabela.Linhas.Single(l => l.Cod == "CCC").Jogos.Should().Be(0);
        tabela.Linhas.Single(l => l.Cod == "DDD").Jogos.Should().Be(0);
    }

    [Fact(DisplayName = "RN-01: vitória vale 3 pontos, derrota conta o saldo de gols negativo, empate vale 1 ponto")]
    public void PontuacaoESaldoDeGols()
    {
        var selecoes = new[] { Time("AAA", "A", 1), Time("BBB", "A", 2), Time("CCC", "A", 3), Time("DDD", "A", 4) };
        var vitoria = new Jogo("A1", Fase.Grupos, "A", "AAA", null, "BBB", null);
        vitoria.RegistrarPlacar(3, 0);
        var empate = new Jogo("A2", Fase.Grupos, "A", "CCC", null, "DDD", null);
        empate.RegistrarPlacar(1, 1);

        var tabela = Classificacao.CalcularGrupo("A", selecoes, new[] { vitoria, empate });

        var vencedor = tabela.Linhas.Single(l => l.Cod == "AAA");
        var perdedor = tabela.Linhas.Single(l => l.Cod == "BBB");
        vencedor.Pontos.Should().Be(3);
        vencedor.SaldoDeGols.Should().Be(3);
        perdedor.Pontos.Should().Be(0);
        perdedor.SaldoDeGols.Should().Be(-3);
        tabela.Linhas.Count(l => l.Pontos == 1).Should().Be(2);
    }

    [Fact(DisplayName = "RN-01: empate em pontos entre 4 times é desfeito pelo saldo de gols geral")]
    public void EmpateResolvidoPorSaldoDeGolsGeral()
    {
        var selecoes = new[] { Time("AAA", "A", 1), Time("BBB", "A", 2), Time("CCC", "A", 3), Time("DDD", "A", 4) };
        var jogos = new List<Jogo>
        {
            Placar(new Jogo("A1", Fase.Grupos, "A", "AAA", null, "BBB", null), 0, 0),
            Placar(new Jogo("A2", Fase.Grupos, "A", "AAA", null, "CCC", null), 4, 0),
            Placar(new Jogo("A3", Fase.Grupos, "A", "AAA", null, "DDD", null), 0, 1),
            Placar(new Jogo("A4", Fase.Grupos, "A", "BBB", null, "CCC", null), 0, 3),
            Placar(new Jogo("A5", Fase.Grupos, "A", "BBB", null, "DDD", null), 3, 0),
            Placar(new Jogo("A6", Fase.Grupos, "A", "CCC", null, "DDD", null), 1, 1),
        };

        var tabela = Classificacao.CalcularGrupo("A", selecoes, jogos);

        tabela.Linhas.Should().OnlyContain(l => l.Pontos == 4, "todos empatam em 4 pontos");
        tabela.Linhas.Select(l => l.Cod).Should().Equal("AAA", "BBB", "CCC", "DDD");
    }

    [Fact(DisplayName = "RN-01: empate em pontos, saldo e gols marcados é desfeito pelo confronto direto")]
    public void EmpateResolvidoPeloConfrontoDireto()
    {
        var selecoes = new[] { Time("EEE", "A", 1), Time("FFF", "A", 2), Time("GGG", "A", 3), Time("HHH", "A", 4) };
        var jogos = new List<Jogo>
        {
            Placar(new Jogo("A1", Fase.Grupos, "A", "EEE", null, "FFF", null), 1, 0), // confronto direto: EEE vence FFF
            Placar(new Jogo("A2", Fase.Grupos, "A", "EEE", null, "GGG", null), 0, 0),
            Placar(new Jogo("A3", Fase.Grupos, "A", "EEE", null, "HHH", null), 0, 1),
            Placar(new Jogo("A4", Fase.Grupos, "A", "FFF", null, "GGG", null), 1, 0),
            Placar(new Jogo("A5", Fase.Grupos, "A", "FFF", null, "HHH", null), 0, 0),
            Placar(new Jogo("A6", Fase.Grupos, "A", "GGG", null, "HHH", null), 0, 0),
        };

        var tabela = Classificacao.CalcularGrupo("A", selecoes, jogos);

        var eee = tabela.Linhas.Single(l => l.Cod == "EEE");
        var fff = tabela.Linhas.Single(l => l.Cod == "FFF");
        eee.Pontos.Should().Be(fff.Pontos);
        eee.SaldoDeGols.Should().Be(fff.SaldoDeGols);
        eee.GolsPro.Should().Be(fff.GolsPro);
        eee.Posicao.Should().BeLessThan(fff.Posicao, "EEE venceu o confronto direto contra FFF");
        fff.CriterioDesempate.Should().Be("confronto direto");
    }

    [Fact(DisplayName = "RN-01: empate remanescente após o confronto direto é desfeito pelo ranking FIFA, e quem não está no ranking fica por último")]
    public void EmpateRemanescenteResolvidoPeloRankingFifa()
    {
        var selecoes = new[]
        {
            Time("III", "A", 1, ranking: 5),
            Time("JJJ", "A", 2, ranking: 2),
            Time("KKK", "A", 3, ranking: null),
            Time("LLL", "A", 4, ranking: 30),
        };
        var jogos = RodizioDoGrupo("A", "III", "JJJ", "KKK", "LLL");
        foreach (var jogo in jogos) jogo.RegistrarPlacar(0, 0); // todos empatam 0x0

        var tabela = Classificacao.CalcularGrupo("A", selecoes, jogos);

        tabela.Linhas.Select(l => l.Cod).Should().Equal("JJJ", "III", "LLL", "KKK");
        tabela.Linhas.Skip(1).Should().OnlyContain(l => l.CriterioDesempate == "ranking FIFA");
    }

    [Fact(DisplayName = "Zona: grupo incompleto deixa todas as posições indefinidas")]
    public void ZonaIndefinidaEnquantoGrupoIncompleto()
    {
        var selecoes = new[] { Time("AAA", "A", 1), Time("BBB", "A", 2), Time("CCC", "A", 3), Time("DDD", "A", 4) };
        var jogos = RodizioDoGrupo("A", "AAA", "BBB", "CCC", "DDD");
        jogos[0].RegistrarPlacar(1, 0);

        var tabela = Classificacao.CalcularGrupo("A", selecoes, jogos);

        tabela.Linhas.Should().OnlyContain(l => Classificacao.ZonaDe(tabela, l) == ZonaClassificacao.Indefinido);
    }

    [Fact(DisplayName = "Zona: com o grupo completo, 1º e 2º são sempre classificados e o 4º é sempre eliminado")]
    public void PrimeiroSegundoClassificadosQuartoEliminado()
    {
        var selecoes = new[] { Time("AAA", "A", 1), Time("BBB", "A", 2), Time("CCC", "A", 3), Time("DDD", "A", 4) };
        var jogos = RodizioDoGrupo("A", "AAA", "BBB", "CCC", "DDD");
        var n = 0;
        foreach (var jogo in jogos)
        {
            jogo.RegistrarPlacar(n % 4, (n + 1) % 3);
            n += 1;
        }

        var tabela = Classificacao.CalcularGrupo("A", selecoes, jogos);

        Classificacao.ZonaDe(tabela, tabela.Linhas[0]).Should().Be(ZonaClassificacao.Classificado);
        Classificacao.ZonaDe(tabela, tabela.Linhas[1]).Should().Be(ZonaClassificacao.Classificado);
        Classificacao.ZonaDe(tabela, tabela.Linhas[3]).Should().Be(ZonaClassificacao.Eliminado);
    }

    private static Jogo Placar(Jogo jogo, int golsMandante, int golsVisitante)
    {
        jogo.RegistrarPlacar(golsMandante, golsVisitante);
        return jogo;
    }
}
