using PortalCopa26.Domain.Jogos;

namespace PortalCopa26.Domain.MataMata;

/// <summary>
/// Resolve o chaveamento do mata-mata: quem avança em cada confronto e como o
/// vencedor (ou perdedor, na disputa de 3º lugar) se propaga para o jogo seguinte.
/// Tradução de <c>resolverMataMata</c> em <c>classificacao.js</c> — a lógica não foi
/// reinventada, só traduzida para C#.
/// </summary>
public static class Chaveamento
{
    /// <summary>
    /// Resolve os jogos informados. A lista deve vir na ordem das fases do
    /// mata-mata (segunda fase → oitavas → quartas → semifinal → 3º lugar → final),
    /// para que a referência de um jogo já esteja resolvida quando o jogo que
    /// depende dela for processado.
    /// </summary>
    public static IReadOnlyDictionary<string, ResultadoConfronto> Resolver(IReadOnlyList<Jogo> jogosDoMataMata)
    {
        var mapa = new Dictionary<string, ResultadoConfronto>();

        string? LadoDe(string? codigo, ReferenciaJogo? referencia)
        {
            if (codigo is not null) return codigo;
            if (referencia is null) return null;
            if (!mapa.TryGetValue(referencia.JogoId, out var origem) || !origem.Decidido) return null;
            return referencia.Tipo == TipoReferencia.Vencedor ? origem.Vencedor : origem.Perdedor;
        }

        foreach (var jogo in jogosDoMataMata)
        {
            if (jogo.Fase == Fase.Grupos)
                throw new DomainException($"O jogo {jogo.Id} é da fase de grupos e não faz parte do chaveamento do mata-mata.");

            var mandante = LadoDe(jogo.Mandante, jogo.MandanteRef);
            var visitante = LadoDe(jogo.Visitante, jogo.VisitanteRef);

            string? vencedor = null;
            string? perdedor = null;
            var decidido = false;
            var nosPenaltis = false;
            var empatado = false;

            if (mandante is not null && visitante is not null && jogo.PlacarDefinido)
            {
                var golsMandante = jogo.PlacarMandante!.Value;
                var golsVisitante = jogo.PlacarVisitante!.Value;

                if (golsMandante > golsVisitante)
                {
                    vencedor = mandante;
                    perdedor = visitante;
                    decidido = true;
                }
                else if (golsMandante < golsVisitante)
                {
                    vencedor = visitante;
                    perdedor = mandante;
                    decidido = true;
                }
                else
                {
                    empatado = true;
                    if (jogo.PenaltisDefinidos)
                    {
                        nosPenaltis = true;
                        decidido = true;
                        if (jogo.PenaltisMandante!.Value > jogo.PenaltisVisitante!.Value)
                        {
                            vencedor = mandante;
                            perdedor = visitante;
                        }
                        else
                        {
                            vencedor = visitante;
                            perdedor = mandante;
                        }
                    }
                }
            }

            mapa[jogo.Id] = new ResultadoConfronto(
                jogo.Id,
                mandante,
                visitante,
                jogo.PlacarMandante,
                jogo.PlacarVisitante,
                vencedor,
                perdedor,
                decidido,
                nosPenaltis,
                empatado);
        }

        return mapa;
    }
}
