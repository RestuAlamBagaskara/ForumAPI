const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 401 if payload not access token', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {},
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 if payload not contain needed property', async () => {
      const loginPayload = {
        username: 'alam',
        password: 'password',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'alam',
          password: 'password',
          fullname: 'alam bagas',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {},
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat utas baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 if payload not meet data type specification', async () => {
      const loginPayload = {
        username: 'alam',
        password: 'password',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'alam',
          password: 'password',
          fullname: 'alam bagas',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Redemption Arc',
          body: 400,
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat utas baru karena tipe data tidak sesuai',
      );
    });

    it('should response 201 and create new thread', async () => {
      const loginPayload = {
        username: 'alam',
        password: 'password',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'alam',
          password: 'password',
          fullname: 'alam bagas',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Redemption Arc',
          body: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread.title).toEqual('Redemption Arc');
    });
  });

  describe('when GET /threads/{id}', () => {
    it('should response 404 when thread not valid', async () => {
      const loginPayload = {
        username: 'alam',
        password: 'password',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'alam',
          password: 'password',
          fullname: 'alam bagas',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-404',
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('No threads found');
    });

    it('should response 200 and return detail thread', async () => {
      const loginPayload = {
        username: 'alam',
        password: 'password',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'alam',
          password: 'password',
          fullname: 'alam bagas',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Redemption Arc',
          body: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const threadResponse = JSON.parse(thread.payload);

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadResponse.data.addedThread.id}`,
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.id).toEqual(
        threadResponse.data.addedThread.id,
      );
      expect(responseJson.data.thread.title).toEqual('Redemption Arc');
      expect(responseJson.data.thread.body).toEqual(
        'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      );
      expect(responseJson.data.thread.username).toEqual('alam');
      expect(Array.isArray(responseJson.data.thread.comments)).toBe(true);
      if (Array.isArray(responseJson.data.thread.comments)) {
        responseJson.data.thread.comments.forEach((comments) => {
          if (comments.replies) {
            expect(
              Array.isArray(responseJson.data.thread.comments.replies),
            ).toBe(true);
          }
        });
      }
    });
  });
});
