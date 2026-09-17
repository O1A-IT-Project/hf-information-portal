using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Infrastructure.Scoping;

// Returns a list of survey details
[ApiController]
[Route("api/forms")]
public class FormsController : ControllerBase
{
    private readonly IScopeProvider _scopeProvider;

    public FormsController(IScopeProvider scopeProvider)
    {
        _scopeProvider = scopeProvider;
    }

    [HttpGet]
    public IActionResult GetForms()
    {
        using var scope = _scopeProvider.CreateScope();

        var forms = scope.Database.Fetch<dynamic>(
            "SELECT * FROM UFForms"
            );
        
        var result = forms
        .Select(form => new
        {
            Id = form.Key?.ToString(),
            Name = form.Name?.ToString(),
            CreatedBy = form.CreatedBy,
            Created = form.Created,
            Updated = form.Updated
        })
        .ToList();

    scope.Complete();

    return Ok(result);
}




}

