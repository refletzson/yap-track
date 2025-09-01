#include <stdio.h>
#include <stdbool.h>

int main(){
    
    //    Variables 

    int age = 10;
    int year = 2025;
    int quantaty = 1;

    printf("I am %d years old\n",age);
    printf("This years is the big %d\n",year );
    printf("Im buying %d car\n", quantaty);

    float temperature = 10;
    float price = 19.99;
    float GPA = 3.7;

    printf("Today was cold it was %.1f degrees\n",temperature);
    printf("That thing was $%.2f dollars\n",price);
    printf("My GPA was a solid %.1f\n",GPA);

    double pi = 3.14159265358979;
    double e = 2.71828182846;
    double funny = 67.676767676767676767;

    printf("The value of Pi is %.15lf\n",pi);
    printf("The value of e is %.15lf\n",e);
    printf("Very funny number %.15lf\n",funny);

    char grade = 'A';
    char symbol = '#';
    char letter = 'J';

    printf("Last test a got an %c\n",grade);
    printf("My favorite symbol is %c\n",symbol);
    printf("The best letter is %c\n",letter);

    char name[] = "Jose the Goat";
    char food[] = "Pizza";
    char game[] = "Siege";

    printf("I am %s\n",name);
    printf("I like %s\n",food);
    printf("The best game Rn is %s\n",game);

    bool isOnline = false;

    printf("%d\n",isOnline);

    //   Arithmetic Operators (= + - * / % ++ --)

    int x = 2;
    int y = 3;
    int z = 0;

    //z = x + y;  Adding
    //z = x - y;  Subtracting 
    //z = x * y;  Multiplying
    //z = x / y;  Division (Must change to float, cant divide with int )
    //z = x % 2;  Modulus Operator (Shows Remaining numbers)
    //z++;        Increment (By 1)
    //z--;        Decriment (By 1)
   
// Shortcuts (augmented assignment operators)

    // x+=2
    // x-=3
    // x*=4
    // x/=5
   
    printf("%d",z);
    printf ("Davi e lindo");

    return 0;
}