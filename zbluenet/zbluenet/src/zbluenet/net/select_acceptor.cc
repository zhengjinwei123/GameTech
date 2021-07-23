#include <zbluenet/net/select_acceptor.h>
#include <zbluenet/net/platform.h>
#include <zbluenet/log.h>

namespace zbluenet {
	namespace net {

		SelectAcceptor::SelectAcceptor(TcpSocket *listen_socket, uint16_t max_socket_num) :
			Acceptor(listen_socket, max_socket_num)
		{
			fd_read_.create(max_socket_num);
		}

		SelectAcceptor::~SelectAcceptor()
		{

		}

		void SelectAcceptor::loop()
		{
			while (!quit_) {
				fd_read_.zero();

				fd_read_.add(listen_socket_->GetFD());

				timeval dt = { 0, 0 };
				int ret = select(listen_socket_->GetFD() + 1, fd_read_.fdset(), nullptr, nullptr, &dt);
				if (ret < 0) {
					if (errno == EINTR) {
						continue;
					}
					quit_ = true;
					break;
				}

				if (fd_read_.has(listen_socket_->GetFD())) {
					this->accept();
				}
			}
		}
	} // namespace net
} // namespace zbluenet