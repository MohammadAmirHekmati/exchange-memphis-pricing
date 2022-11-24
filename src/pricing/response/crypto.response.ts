import { CryptoEnt } from "../dto/crypto.entity";

    export interface Crypto {
        create_at: Date;
        update_at: Date;
        delete_at?: any;
        id: string;
        symbol_crypto: string;
        name_crypto: string;
        persian_name: string;
        type_fiat: string;
        stable_coin: boolean;
        decimal: number;
        step_size_order: string;
        step_size_withdraw: string;
        type_get_price: string;
        link_price: string;
        result_link_price: string;
        crypto_socket: string;
        repository_price: string;
    }

    export interface ResponseCrypto {
        status: string;
        data: CryptoEnt[];
        ts: number;
    }
