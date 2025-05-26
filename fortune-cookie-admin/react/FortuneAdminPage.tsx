
import React from 'react'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'
import CookieTable from './CookieTable'

const FortuneAdminPage: React.FC = () => (
  <Layout
    pageHeader={<PageHeader title="Fortune cookies" />}
  >
    <PageBlock variation="full">
      <h2> Frases para Galleta de la Fortuna </h2>
      <CookieTable />
    </PageBlock>
  </Layout>
)

export default FortuneAdminPage

