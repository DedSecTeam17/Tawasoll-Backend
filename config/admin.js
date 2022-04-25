module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '2403f8da96d81e0c485ea64c255a0676'),
  },
});
