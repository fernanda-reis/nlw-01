import { Request, Response } from 'express';
import knex from '../database/connection';

class PontosController {
    
    async showAll(request: Request, response: Response) {
        const pontos = await knex('pontos').select('*');

        return response.json(pontos);
    }
    
    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
        .split(',')
        .map(item => Number(item.trim()));

        const pontos = await knex('pontos')
        .join('pontos_items', 'pontos.id', '=', 'pontos_items.ponto_id')
        .whereIn('pontos_items.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('pontos.*');

        const serializedPontos = pontos.map(ponto => {
            return {
                ...ponto,
                image_url: `http://192.168.0.169:3333/uploads/${ponto.image}`,
            };
        });

        return response.json(serializedPontos);
    }

    async show(request: Request, response: Response) {
        const id = request.params.id;

        const ponto = await knex('pontos').where('id', id).first();

        if(!ponto) {
            return response.status(400).json({message: 'Ponto de coleta não encontrado.'});
        }

        const serializedPonto = {
            ...ponto,
            image_url: `http://192.168.0.169:3333/uploads/${ponto.image}`,
        };

        /**
         * SELECT items.title FROM items 
         * JOIN pontos_items ON items.id = pontos_items.item_id
         * WHERE pontos_items.ponto_id = {id}
         * 
         */
        const items = await knex('items')
        .join('pontos_items', 'items.id', '=', 'pontos_items.item_id')
        .where('pontos_items.ponto_id', id)
        .select('items.title')

        return response.json({ponto: serializedPonto, items});
    }

    async create(request: Request, response: Response) {
        /*{
            "name": "Parque SABESP",
            "email": "sabesp@hotmailcom",
            "whatsapp": "9832",
            "latitude": "-23.456525",
            "longitude": "-46.580477",
            "city": "São Paulo",
            "uf": "SP",
            "items": [
                1,
                2,
                5
            ]
        }
        */

        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;

        const trx = await knex.transaction();

        const ponto = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }


        const novoPontoId = await trx('pontos').insert(ponto);

        const ponto_id = novoPontoId[0];

        const itemsPonto = items
            .split(',')
            .map( (item: string) => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    item_id,
                    ponto_id
                }
        });

        await trx('pontos_items').insert(itemsPonto);

        await trx.commit();

        return response.json({
            //id + todos os items do ponto
            id: ponto_id,
            ...ponto,
        });
    }
}

export default PontosController;  