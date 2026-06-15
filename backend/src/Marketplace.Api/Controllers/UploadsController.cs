using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Api.Controllers;

[ApiController]
[Route("api/uploads")]
[Authorize]
public class UploadsController(IWebHostEnvironment env) : ControllerBase
{
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0) return BadRequest(new { message = "No file provided." });
        if (file.Length > MaxFileSize) return BadRequest(new { message = "File exceeds 5 MB limit." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            return BadRequest(new { message = "Only JPG, PNG, and WebP files are allowed." });

        var uploadsDir = Path.Combine(env.WebRootPath, "uploads");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream, ct);

        var url = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
        return Ok(new { url });
    }
}
