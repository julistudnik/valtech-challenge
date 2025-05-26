
import React from 'react'
import { Layout, PageBlock, PageHeader, ToastProvider } from 'vtex.styleguide'
import CookieTable from './CookieTable'

const FortuneAdminPage: React.FC = () => (
  <ToastProvider positioning="window">      
    <Layout pageHeader={<PageHeader title="Fortune cookies" />}>
      <PageBlock variation="full">
        <h2>Frases para Galleta de la Fortuna</h2>
        <CookieTable />
      </PageBlock>
    </Layout>
  </ToastProvider>
)

export default FortuneAdminPage
