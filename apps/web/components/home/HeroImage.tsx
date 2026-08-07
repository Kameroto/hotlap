import {
  BatteryCharging,
  Gauge,
  Radio,
  Settings2,
  Zap,
} from "lucide-react";

const specifications = [
  {
    icon: Gauge,
    label:
      "Top Speed",
    value:
      "70+",
    suffix:
      "km/h",
  },

  {
    icon: Settings2,
    label:
      "Drive",
    value:
      "4WD",
    suffix:
      "",
  },

  {
    icon: BatteryCharging,
    label:
      "Power",
    value:
      "LiPo",
    suffix:
      "",
  },
];

export default function HeroImage() {
  return (
    <div className="relative mx-auto w-full max-w-[760px] lg:mx-0">
      <div className="absolute -inset-12 -z-10 rounded-full bg-primary/10 blur-[100px]" />

      <div className="relative min-h-[420px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0c0f12] shadow-[0_30px_100px_rgba(0,0,0,0.65)] sm:min-h-[520px] lg:min-h-[600px]">
        <div className="absolute inset-0 hotlap-grid-background opacity-50" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_40%,rgba(255,106,0,0.17),transparent_33%)]" />

        <div className="absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(to_top,rgba(0,0,0,0.88),transparent)]" />

        <div className="absolute top-5 left-5 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.15em] text-muted-foreground backdrop-blur-md">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />

          HotLap Performance
        </div>

        <div className="absolute top-5 right-5 z-20 rounded-lg border border-primary/25 bg-primary/8 p-2.5 text-primary backdrop-blur-md">
          <Radio className="size-5" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative mt-4 flex h-[270px] w-[82%] max-w-[570px] items-center justify-center sm:h-[340px]">
            <div className="absolute bottom-[13%] h-10 w-[76%] rounded-[100%] bg-black/90 blur-xl" />

            <div className="absolute h-[64%] w-[78%] -skew-x-6 rounded-[38%_58%_28%_32%] border border-white/8 bg-[linear-gradient(145deg,#272d32_0%,#111417_38%,#080a0c_68%,#1f2428_100%)] shadow-[inset_-20px_-22px_35px_rgba(0,0,0,0.65),inset_15px_12px_35px_rgba(255,255,255,0.045),0_25px_55px_rgba(0,0,0,0.6)]">
              <div className="absolute top-[17%] left-[27%] h-[31%] w-[42%] skew-x-6 rounded-[42%_55%_18%_18%] border border-white/10 bg-[linear-gradient(160deg,#191d21,#080a0c)]" />

              <div className="absolute top-[8%] right-[5%] h-[10px] w-[36%] skew-x-6 rounded-full bg-primary shadow-[0_0_18px_rgba(255,106,0,0.38)]" />

              <div className="absolute top-[42%] left-[9%] h-[7px] w-[70%] skew-x-6 rounded-full bg-primary/90" />

              <div className="absolute top-[47%] left-[42%] skew-x-6 text-[clamp(1rem,3vw,2rem)] font-black italic tracking-[-0.08em] text-white/90">
                HOTL
                <span className="text-primary">
                  A
                </span>
                P
              </div>
            </div>

            <Wheel className="left-[5%]" />

            <Wheel className="right-[5%]" />

            <div className="absolute bottom-[20%] left-[16%] flex items-center gap-2 text-primary">
              <Zap className="size-4 fill-current" />

              <span className="text-xs font-bold uppercase tracking-[0.15em]">
                Race Ready
              </span>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-5 bottom-5 z-20 grid grid-cols-3 gap-2 sm:inset-x-6 sm:bottom-6 sm:gap-3">
          {specifications.map(
            ({
              icon: Icon,
              label,
              value,
              suffix,
            }) => (
              <div
                key={
                  label
                }
                className="rounded-xl border border-white/10 bg-black/45 p-3 backdrop-blur-xl sm:p-4"
              >
                <div className="flex items-center gap-2 text-primary">
                  <Icon className="size-4" />

                  <span className="hidden text-[0.64rem] font-bold uppercase tracking-[0.13em] text-muted-foreground sm:inline">
                    {label}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                    {value}
                  </span>

                  {suffix && (
                    <span className="text-[0.65rem] text-muted-foreground">
                      {suffix}
                    </span>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function Wheel({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={`absolute bottom-[7%] size-[25%] max-h-[150px] max-w-[150px] rounded-full border-[10px] border-[#050607] bg-[#171a1d] shadow-[0_8px_22px_rgba(0,0,0,0.75)] sm:border-[14px] ${className ?? ""}`}
    >
      <div className="absolute inset-[23%] rounded-full border border-white/12 bg-[#090b0d]">
        <div className="absolute inset-[30%] rounded-full bg-primary shadow-[0_0_12px_rgba(255,106,0,0.4)]" />
      </div>
    </div>
  );
}