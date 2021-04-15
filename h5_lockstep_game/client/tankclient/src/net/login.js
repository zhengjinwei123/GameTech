import { Form, Input, Button, PageHeader } from 'antd'



const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

const Login = ({className, onLogin}) => {

    const onFinish = (values) => {
        onLogin(values.username, values.password)
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <Form
        {...layout}
        name="basic"
        initialValues={{
            remember: true,
        }}
        className={className}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        >
        <PageHeader
            className="site-page-header"
            title="坦克大作战"
            subTitle="websocket,protobuf,H5,帧同步"
        />,
        <Form.Item
            label="用戶名"
            name="username"
            rules={[
            {
                required: true,
                message: 'Please input your username!',
            },
            ]}
        >
            <Input />
        </Form.Item>

        <Form.Item
            label="密碼"
            name="password"
            rules={[
            {
                required: true,
                message: 'Please input your password!',
            },
            ]}
        >
            <Input.Password />
        </Form.Item>
        <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
            进入游戏
            </Button>
        </Form.Item>
        </Form>
    );
};

export default Login