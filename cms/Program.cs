using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .Build();

// Allow the React client to call the CMS API from the local development origins.
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173")

                      .AllowAnyHeader()
                      .AllowCredentials()
                      .AllowAnyMethod();
    });
});


// Load the shared JWT secret at startup so authentication cannot run with an invalid configuration.
var secret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret is not configured");
var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

// Validate bearer tokens issued by the Node.js identity service.
builder.Services.AddAuthentication()
.AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = securityKey,
                ClockSkew = TimeSpan.FromSeconds(30)
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    // The client stores the JWT in a cookie, so only copy it when the
                    // request comes from one of the explicitly allowed local origins.
                    if (string.IsNullOrEmpty(context.Token) &&
                          context.Request.Cookies.TryGetValue("jwt", out var token))
                    {
                        var origin = context.Request.Headers.Origin.ToString();
                        var allowedOrigins = new[] { "http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173" };


                        if (!string.IsNullOrEmpty(origin) && allowedOrigins.Contains(origin))
                        {
                            context.Token = token;
                        }
                    }
                    return Task.CompletedTask;
                }
            };
        });

WebApplication app = builder.Build();


await app.BootUmbracoAsync();

app.UseRouting();

// CORS must run before authentication and authorization for browser requests.
app.UseCors("ReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

await app.RunAsync();
