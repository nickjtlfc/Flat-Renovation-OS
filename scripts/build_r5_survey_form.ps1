[CmdletBinding()]
param(
    [string]$HtmlPath,
    [string]$PdfPath
)

$ErrorActionPreference = 'Stop'

if (-not $HtmlPath) {
    $HtmlPath = Join-Path $PSScriptRoot '..\docs\survey\LASER_SURVEY_FORM_R5.html'
}
if (-not $PdfPath) {
    $PdfPath = Join-Path $PSScriptRoot '..\docs\survey\LASER_SURVEY_FORM_R5.pdf'
}

$chromeCandidates = @(
    'C:\Program Files\Google\Chrome\Application\chrome.exe',
    'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
    'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
)
$browser = $chromeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $browser) {
    throw 'Chrome or Edge was not found.'
}

$resolvedHtml = (Resolve-Path -LiteralPath $HtmlPath).Path
$resolvedPdf = [System.IO.Path]::GetFullPath($PdfPath)
$tempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$profile = Join-Path $tempRoot ('flat-renovation-r5-form-' + [guid]::NewGuid().ToString('N'))

try {
    New-Item -ItemType Directory -Path $profile | Out-Null
    $url = [System.Uri]::new($resolvedHtml).AbsoluteUri
    $arguments = @(
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        "--user-data-dir=$profile",
        '--no-pdf-header-footer',
        "--print-to-pdf=$resolvedPdf",
        $url
    )
    $process = Start-Process -FilePath $browser -ArgumentList $arguments -Wait -PassThru -WindowStyle Hidden
    if ($process.ExitCode -ne 0) {
        throw "Browser PDF generation failed with exit code $($process.ExitCode)."
    }
    if (-not (Test-Path -LiteralPath $resolvedPdf)) {
        throw "Browser did not create $resolvedPdf."
    }

    # Chrome varies only these metadata timestamps between otherwise identical
    # print runs. Normalise them in place (same byte length) so the maintained
    # HTML-to-PDF output is reproducible and suitable for hash-based audits.
    $pdfBytes = [System.IO.File]::ReadAllBytes($resolvedPdf)
    $pdfAscii = [System.Text.Encoding]::ASCII.GetString($pdfBytes)
    foreach ($field in @('CreationDate', 'ModDate')) {
        $pattern = "/$field \(D:\d{14}\+00'00'\)"
        $match = [regex]::Match($pdfAscii, $pattern)
        if (-not $match.Success) {
            throw "Generated PDF is missing expected $field metadata."
        }
        $replacement = "/$field (D:20260803000000+00'00')"
        if ($replacement.Length -ne $match.Length) {
            throw "Refusing variable-length PDF metadata replacement for $field."
        }
        $replacementBytes = [System.Text.Encoding]::ASCII.GetBytes($replacement)
        [System.Array]::Copy($replacementBytes, 0, $pdfBytes, $match.Index, $replacementBytes.Length)
    }
    [System.IO.File]::WriteAllBytes($resolvedPdf, $pdfBytes)

    $header = [System.IO.File]::ReadAllBytes($resolvedPdf)[0..4]
    if ([System.Text.Encoding]::ASCII.GetString($header) -ne '%PDF-') {
        throw 'Generated file does not have a PDF header.'
    }
    Write-Output "Generated $resolvedPdf"
}
finally {
    $resolvedProfile = [System.IO.Path]::GetFullPath($profile)
    if (-not $resolvedProfile.StartsWith($tempRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove non-temporary profile path: $resolvedProfile"
    }
    if (Test-Path -LiteralPath $resolvedProfile) {
        Remove-Item -LiteralPath $resolvedProfile -Recurse -Force
    }
}
