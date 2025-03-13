namespace robot {
    // https://github.com/elecfreaks/pxt-Cutebot-Pro/blob/master/main.ts
    const i2cAddr: number = 0x10

    function delay_ms(ms: number) {
        let endTime = input.runningTime() + ms;
        while (endTime > input.runningTime()) {

        }
    }

    function i2cCommandSend(command: number, params: number[]) {
        let buff = pins.createBuffer(params.length + 4);
        buff[0] = 0xFF; // 帧头
        buff[1] = 0xF9; // 帧头
        buff[2] = command; // 指令
        buff[3] = params.length; // 参数长度
        for (let i = 0; i < params.length; i++) {
            buff[i + 4] = params[i];
        }
        pins.i2cWriteBuffer(i2cAddr, buff);
        delay_ms(1);
    }

    function motorControl(leftSpeed: number, rightSpeed: number): void {
        i2cCommandSend(0x10, [2, Math.abs(leftSpeed), Math.abs(rightSpeed), (leftSpeed < 0 ? 0x01 : 0x00) | (rightSpeed < 0 ? 0x02 : 0x00)]);
    }

    const enum TrackbitStateType {
        //% block="◌ ◌ ◌ ◌"
        Tracking_State_0 = 0,
        //% block="◌ ● ● ◌"
        Tracking_State_1 = 6,
        //% block="◌ ◌ ● ◌"
        Tracking_State_2 = 4,
        //% block="◌ ● ◌ ◌"
        Tracking_State_3 = 2,

        //% block="● ◌ ◌ ●"
        Tracking_State_4 = 9,
        //% block="● ● ● ●"
        Tracking_State_5 = 15,
        //% block="● ◌ ● ●"
        Tracking_State_6 = 13,
        //% block="● ● ◌ ●"
        Tracking_State_7 = 11,

        //% block="● ◌ ◌ ◌"
        Tracking_State_8 = 1,
        //% block="● ● ● ◌"
        Tracking_State_9 = 7,
        //% block="● ◌ ● ◌"
        Tracking_State_10 = 5,
        //% block="● ● ◌ ◌"
        Tracking_State_11 = 3,

        //% block="◌ ◌ ◌ ●"
        Tracking_State_12 = 8,
        //% block="◌ ● ● ●"
        Tracking_State_13 = 14,
        //% block="◌ ◌ ● ●"
        Tracking_State_14 = 12,
        //% block="◌ ● ◌ ●"
        Tracking_State_15 = 10,
    }

    class I2CLineDetector implements drivers.LineDetectors {
        start(): void { }
        lineState(state: number[]): void {
            let v = this.trackbitStateValue()
            state[RobotLineDetector.Left] =
                v & TrackbitStateType.Tracking_State_11 ? 1023 : 0
            state[RobotLineDetector.Right] =
                v & TrackbitStateType.Tracking_State_14 ? 1023 : 0
            state[RobotLineDetector.OuterLeft] =
                v & TrackbitStateType.Tracking_State_8 ? 1023 : 0
            state[RobotLineDetector.OuterRight] =
                v & TrackbitStateType.Tracking_State_12 ? 1023 : 0
        }

        private trackbitStateValue() {
            i2cCommandSend(0x60, [0x00])
            return pins.i2cReadNumber(i2cAddr, NumberFormat.UInt8LE, false)
        }
    }

    // class I2CServoArm implements drivers.Arm {

    //     channel: number

    //     constructor(channel: number) {
    //         this.channel = channel;
    //     }

    //     start(): void {
    //     }

    //     open(aperture: number): void {
    //         i2cCommandSend(0x40, [this.channel, Math.round(Math.map(100 - aperture, 0, 100, 0, 100))]);
    //     }
    // }

    class ElecfreaksTpbotRobot extends robots.Robot {
        constructor() {
            super(0x31e95c0a)
            this.leds = new drivers.WS2812bLEDStrip(DigitalPin.P15, 8)
            this.sonar = new drivers.SR04Sonar(DigitalPin.P12, DigitalPin.P8)
            this.lineDetectors = new I2CLineDetector()
            this.maxLineSpeed = 30
            this.arms = []
            // for (let i = 0; i < 4; i++) {
            //     this.arms.push(new I2CServoArm(i + 1))
            // }
        }

        motorRun(left: number, right: number) {
            motorControl(left, right)
        }

        headlightsSetColor(r: number, g: number, b: number) {
            i2cCommandSend(0x20, [2, r, g, b]);
        }
    }

    /**
     * Cute:bot PRO from Elecfreaks
     */
    //% fixedInstance whenUsed block="elecfreaks cutebot PRO" weight=50
    export const elecfreakstpbot = new RobotDriver(
        new ElecfreaksTpbotRobot()
    )
}
