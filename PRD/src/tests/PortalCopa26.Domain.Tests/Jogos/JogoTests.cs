using FluentAssertions;
using PortalCopa26.Domain;
using PortalCopa26.Domain.Jogos;

namespace PortalCopa26.Domain.Tests.Jogos;

public class JogoTests
{
    [Fact(DisplayName = "Placar negativo lança DomainException")]
    public void PlacarNegativoLancaExcecao()
    {
        var jogo = new Jogo("G01", Fase.Grupos, "A", "AAA", null, "BBB", null);

        var registrar = () => jogo.RegistrarPlacar(-1, 2);

        registrar.Should().Throw<DomainException>();
    }

    [Fact(DisplayName = "Pênaltis só podem ser registrados quando o tempo normal termina empatado (RN-03)")]
    public void PenaltisSemEmpateNoTempoNormalLancaExcecao()
    {
        var jogo = new Jogo("SF01", Fase.Semifinal, null, "AAA", null, "BBB", null);
        jogo.RegistrarPlacar(2, 0);

        var registrar = () => jogo.RegistrarPenaltis(5, 4);

        registrar.Should().Throw<DomainException>();
    }

    [Fact(DisplayName = "A decisão por pênaltis não pode terminar empatada")]
    public void PenaltisEmpatadosLancaExcecao()
    {
        var jogo = new Jogo("SF01", Fase.Semifinal, null, "AAA", null, "BBB", null);
        jogo.RegistrarPlacar(1, 1);

        var registrar = () => jogo.RegistrarPenaltis(4, 4);

        registrar.Should().Throw<DomainException>();
    }

    [Fact(DisplayName = "Um jogo da fase de grupos precisa informar o grupo e não pode depender de referência")]
    public void JogoDeGruposExigeGrupoENaoAceitaReferencia()
    {
        var semGrupo = () => new Jogo("G01", Fase.Grupos, null, "AAA", null, "BBB", null);
        semGrupo.Should().Throw<DomainException>();

        var comReferencia = () => new Jogo("G01", Fase.Grupos, "A", null, new ReferenciaJogo("X", TipoReferencia.Vencedor), "BBB", null);
        comReferencia.Should().Throw<DomainException>();
    }

    [Fact(DisplayName = "Um jogo fora da fase de grupos não pode ter grupo definido")]
    public void JogoForaDeGruposNaoAceitaGrupo()
    {
        var construir = () => new Jogo("SF01", Fase.Semifinal, "A", "AAA", null, "BBB", null);

        construir.Should().Throw<DomainException>();
    }

    [Fact(DisplayName = "Cada lado do jogo deve vir de exatamente uma fonte: código direto ou referência a outro jogo")]
    public void LadoExigeExatamenteUmaFonte()
    {
        var semNenhum = () => new Jogo("SF01", Fase.Semifinal, null, null, null, "BBB", null);
        semNenhum.Should().Throw<DomainException>();

        var comAmbos = () => new Jogo("SF01", Fase.Semifinal, null, "AAA", new ReferenciaJogo("X", TipoReferencia.Vencedor), "BBB", null);
        comAmbos.Should().Throw<DomainException>();
    }

    [Fact(DisplayName = "Um jogo sem placar registrado não conta como disputado (equivalente a placar inválido ser ignorado)")]
    public void JogoSemPlacarNaoEstaDefinido()
    {
        var jogo = new Jogo("G01", Fase.Grupos, "A", "AAA", null, "BBB", null);

        jogo.PlacarDefinido.Should().BeFalse();
        jogo.Status.Should().Be(StatusJogo.Agendado);
    }
}
