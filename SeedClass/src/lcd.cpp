#include "lcd.h"

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

static constexpr uint8_t LCD_ADDRESS = 0x27;
static constexpr uint8_t LCD_COLUMNS = 16;
static constexpr uint8_t LCD_ROWS = 2;

static constexpr uint8_t LCD_SDA_PIN = 5;
static constexpr uint8_t LCD_SCL_PIN = 6;

static LiquidCrystal_I2C lcd(
    LCD_ADDRESS,
    LCD_COLUMNS,
    LCD_ROWS
);

static bool lcdReady = false;

static String fitLine(const String &text)
{
    String output = text;

    if (output.length() > LCD_COLUMNS) {
        output = output.substring(0, LCD_COLUMNS);
    }

    while (output.length() < LCD_COLUMNS) {
        output += " ";
    }

    return output;
}

bool initLcd()
{
    if (lcdReady) {
        return true;
    }

    Wire.begin(
        LCD_SDA_PIN,
        LCD_SCL_PIN
    );

    delay(200);

    lcd.init();
    lcd.backlight();
    lcd.clear();

    lcd.setCursor(0, 0);
    lcd.print("Seed Classifier");

    lcd.setCursor(0, 1);
    lcd.print("LCD Ready");

    lcdReady = true;

    Serial.println("[LCD] Initialized successfully.");

    delay(1000);

    return true;
}

void clearLcd()
{
    if (!lcdReady) {
        return;
    }

    lcd.clear();
}

void displayLcdMessage(
    const String &line1,
    const String &line2
)
{
    if (!lcdReady) {
        return;
    }

    lcd.setCursor(0, 0);
    lcd.print(fitLine(line1));

    lcd.setCursor(0, 1);
    lcd.print(fitLine(line2));
}