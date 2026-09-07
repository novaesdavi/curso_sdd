using FluentAssertions;
using PortalCopa26.Domain;
using PortalCopa26.Domain.Selecoes;

namespace PortalCopa26.Domain.Tests.Selecoes;

public class SelecaoTests
{
    [Fact(DisplayName = "Código FIFA fora do padrão de 3 letras maiúsculas lança DomainException")]
    public void CodigoForaDoPadraoLancaExcecao()
    {
        var construir = () => new Selecao("Bra", "Brasil", "C", 1, true, 5);

        construir.Should().Throw<DomainException>();
    }

    [Theory(DisplayName = "Grupo deve ser uma única letra entre A e L")]
    [InlineData("")]
    [InlineData("M")]
    [InlineData("AB")]
    public void GrupoInvalidoLancaExcecao(string grupo)
    {
        var construir = () => new Selecao("BRA", "Brasil", grupo, 1, true, 5);

        construir.Should().Throw<DomainException>();
    }

    [Fact(DisplayName = "Pote fora do intervalo 1-4 lança DomainException")]
    public void PoteInvalidoLancaExcecao()
    {
        var construir = () => new Selecao("BRA", "Brasil", "C", 5, true, 5);

        construir.Should().Throw<DomainException>();
    }

    [Fact(DisplayName = "Seleção fora do ranking disponível fica sempre atrás das ranqueadas no desempate (RN-01)")]
    public void SemRankingFicaAtrasDeTodasAsRanqueadas()
    {
        var selecao = new Selecao("XYZ", "Seleção Sem Ranking", "A", 4, false, null);

        selecao.RankingPosicao.Should().BeNull();
        selecao.RankingOrdem.Should().Be(int.MaxValue);
    }
}
