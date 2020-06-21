import express from "express"
//validação dos dados para criação do ponto:
//npm install celebrate
//npm install @types/hapi__joi -D
import { celebrate, Joi } from 'celebrate';
import multer from 'multer';
import multerConfig from './config/multer';

import PontosController from './controllers/PontosController';
import ItemsController from './controllers/ItemsController'

const routes = express.Router();
const upload = multer(multerConfig);

const pontosController = new PontosController();
const itemsController = new ItemsController();

routes.get('/items', itemsController.index);
routes.get('/pontos/:id', pontosController.show);
routes.get('/pontos', pontosController.index);
routes.get('/showAll', pontosController.showAll);
routes.post('/pontos', 
    upload.single('image'),
    celebrate ({
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required().email(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().required().max(2),
            items: Joi.string().required(),
        })
    }, {
        abortEarly: false
    }),
    pontosController.create
);




export default routes;