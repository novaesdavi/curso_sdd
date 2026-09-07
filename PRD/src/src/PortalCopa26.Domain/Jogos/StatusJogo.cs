namespace PortalCopa26.Domain.Jogos;

/// <summary>
/// Situação de um jogo, sempre derivada do placar e dos pênaltis registrados —
/// nunca armazenada separadamente, para não correr o risco de ficar inconsistente
/// com o resultado real.
/// </summary>
public enum StatusJogo
{
    Agendado,
    EmAndamento,
    Encerrado,
}
