require 'em-websocket'
require 'json'

client_count = 0

def handle_command(command,data,&block)

  return 'must have code block' if block.arity <1

  parse = data.split(':')

  if parse.size > 0
    params = parse[1].split(',') or [] if parse[1]
    yield params if parse[0] == command
  end

end


EventMachine.run {

  EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8080) do |ws|
    ws.onopen do
      client_count = client_count + 1
    end

    ws.onclose do
      client_count = client_count - 1 if client_count > 0
    end

    ws.onmessage do |msg|

      handle_command 'get_visitors',msg do |params|
        ws.send JSON.generate({:command=>'visitors',:data=>client_count.to_s});
      end

    end

  end
}