import * as sinon from 'sinon';
import * as chai from 'chai';
// @ts-ignore
import chaiHttp = require('chai-http');
import { describe, it, before, after } from 'mocha';

import { app } from '../app';
import User from '../database/models/User';

import { Response } from 'superagent';

chai.use(chaiHttp);

const { expect } = chai;

describe('Verifica se é possível fazer o login com os dados corretos', () => {
  let chaiHttpResponse: Response;

  const userMock = {
    id: 1,
    username: 'Admin',
    role: 'admin',
    email: 'admin@admin.com',
    password: 'secret_admin',
  };

  describe('Verifica se não é possível fazer o login com os dados incorretos', () => {
    before(async () => {
      sinon.stub(User, 'findOne').resolves(userMock as unknown as User);
    });

    after(() => {
      (User.findOne as sinon.SinonStub).restore();
    });

    it('Verifica se possui o retorno esperado', async () => {
      chaiHttpResponse = await chai
        .request(app)
        .post('/login')
        .send({ email: 'admin@admin.com', password: 'secret_admin' });

      expect(chaiHttpResponse.status).to.be.equal(200);
      expect(chaiHttpResponse.body).to.have.property('user');
      expect(chaiHttpResponse.body).to.have.property('token');
    });
  });

  describe('Verifica se não é possível fazer o login com os dados incorretos', () => {
    before(async () => {
      sinon.stub(User, 'findOne').resolves(undefined);
    });

    after(() => {
      (User.findOne as sinon.SinonStub).restore();
    });

    it('Verifica se possui o retorno esperado com o campo username incorreto', async () => {
      chaiHttpResponse = await chai
        .request(app)
        .post('/login')
        .send({ email: 'admin@xablau.com', password: 'secret_admin' });

      expect(chaiHttpResponse.status).to.be.equal(401);
    });

    it('Verifica se possui o retorno esperado com o campo password incorreto', async () => {
      chaiHttpResponse = await chai
        .request(app)
        .post('/login')
        .send({ email: 'admin@admin.com', password: 'senha_invalida' });

      expect(chaiHttpResponse.status).to.be.equal(401);
    });
  });
});
