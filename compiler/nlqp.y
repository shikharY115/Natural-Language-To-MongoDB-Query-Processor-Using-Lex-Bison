%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void yyerror(const char *s);
int yylex(void);
char* mongo_op(char* op);
char output_DB[1024];
char condition[512];
%}

%union {
    char* str;
    int num;
}

%token SHOW ALL FROM FIND DELETE ONE MANY WHERE
%token GREATER LESS THAN EQUAL NOT AND OR
%token INT_TYPE VARCHAR_TYPE
%token <str> IDENTIFIER STRING
%token <num> NUMBER

%type <str> value comparator condition_expr


%%
query:
    SHOW ALL FROM IDENTIFIER FIND condition_expr {
        sprintf(output_DB, "db.%s.find(%s)", $4, $6);
    }
    |
    SHOW ALL FROM IDENTIFIER {
        sprintf(output_DB, "db.%s.find({})", $4);
    }
    |
    DELETE ONE FROM IDENTIFIER WHERE condition_expr {
        sprintf(output_DB, "db.%s.deleteOne(%s)", $4, $6);
    }
    |
    DELETE MANY FROM IDENTIFIER WHERE condition_expr {
        sprintf(output_DB, "db.%s.deleteMany(%s)", $4, $6);
    }
    |
    DELETE ALL FROM IDENTIFIER {
        sprintf(output_DB, "db.%s.deleteMany()", $4);
    }
;
condition_expr:
    IDENTIFIER comparator value {
        sprintf(condition,
            "{ \"%s\": { \"%s\": %s } }",
            $1, mongo_op($2), $3
        );
        $$ = strdup(condition);
    }
    |
    condition_expr AND condition_expr {
        sprintf(condition,
            "{ \"$and\": [ %s, %s ] }",
            $1, $3
        );
        $$ = strdup(condition);
    }
    |
    condition_expr OR condition_expr {
        sprintf(condition,
            "{ \"$or\": [ %s, %s ] }",
            $1, $3
        );
        $$ = strdup(condition);
    }
    |
    NOT condition_expr {
        sprintf(condition,
            "{ \"$not\": %s }",
            $2
        );
        $$ = strdup(condition);
    }
;

comparator:
    GREATER THAN      { $$ = strdup(">"); }
    |
    LESS THAN         { $$ = strdup("<"); }
    |
    EQUAL             { $$ = strdup("="); }
    |
    NOT EQUAL         { $$ = strdup("!="); }
;

value:
    NUMBER {
        char buffer[32];
        sprintf(buffer, "%d", $1);
        $$ = strdup(buffer);
    }
    |
    STRING {
        char quoted[256];
        sprintf(quoted, "'%s'", $1);
        $$ = strdup(quoted);
    }
;



%%

char* mongo_op(char* op) {
    if (strcmp(op, ">") == 0) return "$gt";
    if (strcmp(op, "<") == 0) return "$lt";
    if (strcmp(op, "=") == 0) return "$eq";
    if (strcmp(op, "!=") == 0) return "$ne";
    return "$eq";
}

void yyerror(const char *s) {
    fprintf(stderr, "Parse error: %s\n", s);
}


