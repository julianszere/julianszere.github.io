$jobname = 'curriculum';

# Check the URLs once per build. Cleanup-only invocations should stay offline.
my $cleanup_only = grep { $_ eq '-c' || $_ eq '-C' || $_ eq '-CA' } @ARGV;
if (!$cleanup_only) {
    my @link_check = (
        'python', 'check_links.py', 'main.tex',
        '--site-origin', 'https://julianszere.github.io',
        '--site-root', '..',
    );
    my $link_check_status = system @link_check;
    die "Link validation failed; compilation stopped.\n" if $link_check_status != 0;
}
