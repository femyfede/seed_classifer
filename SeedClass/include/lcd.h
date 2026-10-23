#ifndef LCD_H
#define LCD_H

#include <Arduino.h>

bool initLcd();

void clearLcd();

void displayLcdMessage(
    const String &line1,
    const String &line2
);

#endif