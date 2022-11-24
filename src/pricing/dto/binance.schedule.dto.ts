export interface K {
    t: number;
    T: number;
    s: string;
    i: string;
    f: number;
    L: number;
    o: string;
    c: string;
    h: string;
    l: string;
    v: string;
    n: number;
    x: boolean;
    q: string;
    V: string;
    Q: string;
    B: string;
}

export interface Data {
    e: string;
    E: number;
    s: string;
    k: K;
}

export interface BinanceScheduleDto {
    stream: string;
    data: Data;
}