using System.Text.RegularExpressions;

namespace PortalCopa26.Domain.Selecoes;

/// <summary>
/// Uma das 48 seleções participantes da Copa do Mundo 2026. Nunca "Team".
/// </summary>
public sealed partial class Selecao
{
    public string Cod { get; }
    public string Nome { get; }
    public string Grupo { get; }
    public int Pote { get; }
    public bool CabecaDeChave { get; }

    /// <summary>
    /// Posição no ranking FIFA usado como último critério de desempate (RN-01).
    /// Nula para as 7 seleções que não constam no ranking disponível.
    /// </summary>
    public int? RankingPosicao { get; }

    /// <summary>
    /// Chave de ordenação para o desempate por ranking FIFA: a própria posição
    /// quando ela existe, ou um valor sempre maior que qualquer posição real —
    /// garantindo que uma seleção fora do ranking fique atrás de todas as
    /// ranqueadas, como exige a RN-01.
    /// </summary>
    public int RankingOrdem => RankingPosicao ?? int.MaxValue;

    public Selecao(string cod, string nome, string grupo, int pote, bool cabecaDeChave, int? rankingPosicao)
    {
        if (string.IsNullOrWhiteSpace(cod) || !CodigoFifaValido().IsMatch(cod))
            throw new DomainException("O código FIFA de uma seleção deve ter exatamente 3 letras maiúsculas.");
        if (string.IsNullOrWhiteSpace(nome))
            throw new DomainException("O nome de uma seleção não pode ser vazio.");
        if (string.IsNullOrWhiteSpace(grupo) || !GrupoValido().IsMatch(grupo))
            throw new DomainException("O grupo de uma seleção deve ser uma única letra entre A e L.");
        if (pote is < 1 or > 4)
            throw new DomainException("O pote de uma seleção deve estar entre 1 e 4.");
        if (rankingPosicao is <= 0)
            throw new DomainException("A posição no ranking FIFA, quando informada, deve ser maior que zero.");

        Cod = cod;
        Nome = nome;
        Grupo = grupo;
        Pote = pote;
        CabecaDeChave = cabecaDeChave;
        RankingPosicao = rankingPosicao;
    }

    [GeneratedRegex("^[A-Z]{3}$")]
    private static partial Regex CodigoFifaValido();

    [GeneratedRegex("^[A-L]$")]
    private static partial Regex GrupoValido();
}
