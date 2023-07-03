import './index.css'

import {
    Layout,
    Nav,
    Avatar,
} from '@douyinfe/semi-ui'
import {
    IconLikeHeart
} from '@douyinfe/semi-icons'

const App = () => {
    const { Header, Content } = Layout
    return (
        <Layout>
            <Header>
                <div>
                    <Nav mode="horizontal" defaultSelectedKeys={['Home']}>
                        <Nav.Header></Nav.Header>
                        <Nav.Item
                            itemKey="MyPlaylist"
                            text="我的歌单"
                            icon={<IconLikeHeart size="large" />}
                        />
                        <Nav.Footer>
                            <Avatar color="orange" size="small">
                                YJ
                            </Avatar>
                        </Nav.Footer>
                    </Nav>
                </div>
            </Header>
            <Content
                style={{
                    padding: '24px',
                    backgroundColor: 'var(--semi-color-bg-0)',
                }}
            >
            </Content>
        </Layout>
    )
}

export default App
