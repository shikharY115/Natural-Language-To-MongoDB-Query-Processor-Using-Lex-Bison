#include <stdio.h>
#include <string.h>

extern int yyparse();
extern void yy_scan_string(const char *);
extern char output_DB[1024];

int main() {
    char input[1024];
    memset(output_DB, 0, sizeof(output_DB));

    // ─── No prompt needed — backend sends input directly ───────
    if (fgets(input, sizeof(input), stdin) == NULL) {
        fprintf(stderr, "Failed to read input.\n");
        return 1;
    }

    yy_scan_string(input);

    if (yyparse() == 0) {
        printf("MongoDB Output: %s\n", output_DB);
        fflush(stdout);   // ← ensure output is flushed to Node.js
        return 0;
    } else {
        fprintf(stderr, "Parsing failed.\n");
        return 1;
    }
}
