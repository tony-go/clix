#include <stdio.h>
#include <stdlib.h>

int main(void)
{
  int zero = 0;

  printf("%d\n", 42 / zero);

  return EXIT_SUCCESS;
}