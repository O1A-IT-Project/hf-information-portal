using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Services;

namespace HFPortal.Controllers
{
    [ApiController]
    [Route("umbraco/api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class MembersController : ControllerBase
    {
        private readonly IMemberService _memberService;

        public MembersController(IMemberService memberService)
        {
            this._memberService = memberService;
        }

        [HttpGet]
        public IActionResult Validate()
        {
            return Ok();
        }

        [HttpPost]
        public IActionResult CreateMember()
        {
            // Cookie Node User ID acts as Umbraco member username
            var nodeUserId = User.FindFirstValue("id");
            var fullName = User.FindFirstValue("fullName");
            var email = User.FindFirstValue("emailaddress");
            var memberTypeAlias = User.FindFirstValue("memberTypeAlias");
            var IsApproved = true;

            var missing = new List<string>();
            if (string.IsNullOrWhiteSpace(nodeUserId)) missing.Add("id");
            if (string.IsNullOrWhiteSpace(email)) missing.Add("email");
            if (string.IsNullOrWhiteSpace(memberTypeAlias)) missing.Add("memberTypeAlias");

            if (missing.Any())
            {
                return BadRequest($"Required claims missing from token: {string.Join(", ", missing)}");
            }

            try
            {
                var existingMember = _memberService.GetByUsername(nodeUserId);

                if (existingMember is not null)
                    return Conflict("Member already exists.");

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
                Console.WriteLine($"An error occurred: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }
    }
}