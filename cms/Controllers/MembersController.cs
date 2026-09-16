using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Services;

namespace HFPortal.Controllers
{
    /// <summary>
    /// Manages the lifecycle of Umbraco Members that mirror users authenticated
    /// by the external Node.js identity service. Umbraco never handles login or
    /// credentials directly — every action here trusts claims extracted from a
    /// JWT issued by Node and validated by the JwtBearer authentication scheme.
    /// </summary>
    [ApiController]
    [Route("umbraco/api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class MembersController : ControllerBase
    {
        private readonly IMemberService _memberService;
        private readonly ILogger _logger;

        /// <summary>
        /// Initializes the controller with Umbraco's member service, used to
        /// query and create <see cref="Umbraco.Cms.Core.Models.IMember"/> records.
        /// </summary>
        /// <param name="memberService">Umbraco's core member service, injected via DI.</param>
        public MembersController(IMemberService memberService, ILogger logger)
        {
            this._memberService = memberService;
            this._logger = logger;
        }

        /// <summary>
        /// Lightweight endpoint used to confirm that a request carries a valid,
        /// unexpired JWT. Returns 200 if the JwtBearer authentication pipeline
        /// accepted the token; returns 401 automatically (before this method runs)
        /// if the token is missing, malformed, or fails signature validation.
        /// </summary>
        /// <returns>200 OK with no body if the token is valid.</returns>
        [HttpGet]
        public IActionResult Validate()
        {
            return Ok();
        }

        /// <summary>
        /// Ensures an Umbraco Member exists for the currently authenticated Node
        /// user, creating one if it doesn't already exist. Identity claims (Node
        /// user id, name, email, member type) are read entirely from the validated
        /// JWT — no request body is required, since the token is the single source
        /// of truth for who the caller is.
        /// </summary>
        /// <remarks>
        /// The Node user's id is stored as the Umbraco member's Username, which
        /// doubles as the lookup key for detecting whether a member already exists.
        /// </remarks>
        /// <returns>
        /// 200 OK with the created member's Umbraco id, username (Node user id),
        /// and email if the member was created successfully.
        /// 400 Bad Request if required claims are missing from the token, or if
        /// member creation fails for another reason (e.g. an invalid member type alias).
        /// 409 Conflict if a member already exists for this Node user.
        /// </returns>
        [HttpPost]
        public IActionResult CreateMember()
        {
            // The Node-issued JWT's "id" claim is used as the Umbraco member's
            // Username, so the two systems can be linked via a single stable value.
            var nodeUserId = User.FindFirstValue("id");
            var fullName = User.FindFirstValue("fullName");
            var email = User.FindFirstValue("emailaddress");
            var memberTypeAlias = User.FindFirstValue("memberTypeAlias");
            var IsApproved = true;

            // Validate presence of every claim CreateMemberWithIdentity requires,
            // and report exactly which ones are missing rather than a generic error —
            // makes it far quicker to tell a token-shape problem from a genuine bug.
            var missing = new List<string>();
            if (string.IsNullOrWhiteSpace(nodeUserId)) missing.Add("id");
            if (string.IsNullOrWhiteSpace(fullName)) missing.Add("fullName");
            if (string.IsNullOrWhiteSpace(email)) missing.Add("email");
            if (string.IsNullOrWhiteSpace(memberTypeAlias)) missing.Add("memberTypeAlias");

            if (missing.Any())
            {
                return BadRequest($"Required claims missing from token: {string.Join(", ", missing)}");
            }

            try
            {
                // Treat "member already exists" as the expected outcome on repeat
                // calls (e.g. this endpoint is hit on every login), not a failure —
                // callers should be able to call this idempotently.
                var existingMember = _memberService.GetByUsername(nodeUserId);

                if (existingMember is not null)
                    return Conflict("Member already exists.");

                // Creates the Umbraco member record itself. IsApproved controls
                // whether the member can log in/be treated as active immediately.
                var member = _memberService.CreateMemberWithIdentity(
                    nodeUserId,
                    email,
                    fullName,
                    memberTypeAlias,
                    IsApproved
                );

                return Ok(new { member.Id, member.Username, member.Email });
            }
            catch (Exception ex)
            {
                // Broad catch: CreateMemberWithIdentity can fail for several reasons
                // (duplicate email, unknown memberTypeAlias, DB constraint, etc.) —
                // surface the message rather than a generic 500 for easier debugging.
                // log server side only
                _logger.LogError(ex, "Failed to create Umbraco member for user {UserId}", nodeUserId);

                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred while creating the member." });
            }
        }
    }
}