using FluentAssertions;
using PortalCopa26.Domain;
using PortalCopa26.Domain.Jogos;
using PortalCopa26.Domain.MataMata;

namespace PortalCopa26.Domain.Tests.MataMata;

public class ChaveamentoTests
{
    [Fact(DisplayName = "Vitória simples no tempo normal decide o confronto, sem precisar de pênaltis")]
    public void VitoriaSimplesNoTempoNormalDecideOConfronto()
    {
        var jogo = new Jogo("SF01", Fase.Semifinal, null, "AAA", null, "BBB", null);
        jogo.RegistrarPlacar(2, 0);

        var resolvidos = Chaveamento.Resolver(new[] { jogo });

        var info = resolvidos["SF01"];
        info.Decidido.Should().BeTrue();
        info.Vencedor.Should().Be("AAA");
        info.Perdedor.Should().Be("BBB");
        info.DecididoNosPenaltis.Should().BeFalse();
    }

    [Fact(DisplayName = "RN-03: empate no tempo normal sem pênaltis ainda informados mantém o confronto não decidido")]
    public void EmpateSemPenaltisAindaInformadosNaoDecide()
    {
        var jogo = new Jogo("SF01", Fase.Semifinal, null, "AAA", null, "BBB", null);
        jogo.RegistrarPlacar(1, 1);

        var resolvidos = Chaveamento.Resolver(new[] { jogo });

        var info = resolvidos["SF01"];
        info.Empatado.Should().BeTrue();
        info.Decidido.Should().BeFalse();
        info.Vencedor.Should().BeNull();
    }

    [Fact(DisplayName = "RN-03: empate no tempo normal com pênaltis informados é decidido pelo placar de pênaltis")]
    public void EmpateComPenaltisInformadosEDecididoPelosPenaltis()
    {
        var jogo = new Jogo("SF01", Fase.Semifinal, null, "AAA", null, "BBB", null);
        jogo.RegistrarPlacar(1, 1);
        jogo.RegistrarPenaltis(4, 3);

        var resolvidos = Chaveamento.Resolver(new[] { jogo });

        var info = resolvidos["SF01"];
        info.Decidido.Should().BeTrue();
        info.DecididoNosPenaltis.Should().BeTrue();
        info.Vencedor.Should().Be("AAA");
        info.Perdedor.Should().Be("BBB");
    }

    [Fact(DisplayName = "Próximo confronto aguarda o resultado do jogo de origem enquanto ele não é decidido")]
    public void ProximoConfrontoAguardaResultadoAnterior()
    {
        var semifinal = new Jogo("SF01", Fase.Semifinal, null, "AAA", null, "BBB", null);
        semifinal.RegistrarPlacar(1, 1); // empatado, sem pênaltis -> não decidido
        var final = new Jogo("FI01", Fase.Final, null, null, new ReferenciaJogo("SF01", TipoReferencia.Vencedor), "CCC", null);

        var resolvidos = Chaveamento.Resolver(new[] { semifinal, final });

        resolvidos["FI01"].Mandante.Should().BeNull();
        resolvidos["FI01"].Decidido.Should().BeFalse();
    }

    [Fact(DisplayName = "Vencedor e perdedor são propagados automaticamente para o confronto seguinte pelo chaveamento")]
    public void VencedorEPerdedorSaoPropagadosParaOConfrontoSeguinte()
    {
        var sf1 = new Jogo("SF01", Fase.Semifinal, null, "AAA", null, "BBB", null);
        sf1.RegistrarPlacar(2, 0);
        var sf2 = new Jogo("SF02", Fase.Semifinal, null, "CCC", null, "DDD", null);
        sf2.RegistrarPlacar(0, 3);
        var final = new Jogo(
            "FI01", Fase.Final, null,
            null, new ReferenciaJogo("SF01", TipoReferencia.Vencedor),
            null, new ReferenciaJogo("SF02", TipoReferencia.Vencedor));
        var terceiroLugar = new Jogo(
            "TL01", Fase.TerceiroLugar, null,
            null, new ReferenciaJogo("SF01", TipoReferencia.Perdedor),
            null, new ReferenciaJogo("SF02", TipoReferencia.Perdedor));

        var resolvidos = Chaveamento.Resolver(new[] { sf1, sf2, final, terceiroLugar });

        resolvidos["FI01"].Mandante.Should().Be("AAA");
        resolvidos["FI01"].Visitante.Should().Be("DDD");
        resolvidos["TL01"].Mandante.Should().Be("BBB");
        resolvidos["TL01"].Visitante.Should().Be("CCC");
    }

    [Fact(DisplayName = "Mata-mata completo produz um campeão e um vice, e o campeão vence todos os seus confrontos")]
    public void MataMataCompletoProduzCampeaoQueVenceuTodosOsConfrontos()
    {
        var segundaFase = new Jogo("SG01", Fase.SegundaFase, null, "AAA", null, "ZZZ", null);
        segundaFase.RegistrarPlacar(2, 1);
        var oitavas = new Jogo("OI01", Fase.Oitavas, null, null, new ReferenciaJogo("SG01", TipoReferencia.Vencedor), "YYY", null);
        oitavas.RegistrarPlacar(2, 1);
        var quartas = new Jogo("QT01", Fase.Quartas, null, null, new ReferenciaJogo("OI01", TipoReferencia.Vencedor), "XXX", null);
        quartas.RegistrarPlacar(2, 1);
        var semifinal = new Jogo("SF01", Fase.Semifinal, null, null, new ReferenciaJogo("QT01", TipoReferencia.Vencedor), "WWW", null);
        semifinal.RegistrarPlacar(2, 1);
        var final = new Jogo("FI01", Fase.Final, null, null, new ReferenciaJogo("SF01", TipoReferencia.Vencedor), "VVV", null);
        final.RegistrarPlacar(2, 1);

        var resolvidos = Chaveamento.Resolver(new[] { segundaFase, oitavas, quartas, semifinal, final });

        var doFinal = resolvidos["FI01"];
        doFinal.Decidido.Should().BeTrue();
        doFinal.Vencedor.Should().Be("AAA");
        doFinal.Perdedor.Should().Be("VVV");

        var jogosDoCampeao = resolvidos.Values.Where(r => r.Mandante == "AAA" || r.Visitante == "AAA").ToList();
        jogosDoCampeao.Should().HaveCount(5, "o campeão disputa da segunda fase até a final");
        jogosDoCampeao.Should().OnlyContain(r => r.Vencedor == "AAA");
    }

    [Fact(DisplayName = "O chaveamento do mata-mata não resolve jogos da fase de grupos")]
    public void NaoResolveJogosDaFaseDeGrupos()
    {
        var jogoDeGrupo = new Jogo("G01", Fase.Grupos, "A", "AAA", null, "BBB", null);

        var resolver = () => Chaveamento.Resolver(new[] { jogoDeGrupo });

        resolver.Should().Throw<DomainException>();
    }
}
