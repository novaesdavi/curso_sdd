namespace PortalCopa26.Domain;

/// <summary>
/// Base de todas as exceções que representam a violação de uma regra de negócio ou
/// invariante do domínio do PortalCopa26. O handler global da aplicação trata esta
/// exceção e suas derivadas de forma genérica.
/// </summary>
public class DomainException : Exception
{
    public DomainException(string mensagem) : base(mensagem)
    {
    }
}
