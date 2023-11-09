defmodule EthereumJSONRPC.HTTP.HTTPoison do
  @moduledoc """
  Uses `HTTPoison` for `EthereumJSONRPC.HTTP`
  """
  require Logger

  alias EthereumJSONRPC.HTTP

  @behaviour HTTP

  @impl HTTP
  def json_rpc(url, json, headers, options) when is_binary(url) and is_list(options) do
    Logger.info("HTTPoison json_rpc 1 #{inspect(options)}")
    Logger.info("HTTPoison json_rpc headers 1 #{inspect(headers)}")
    Logger.info("HTTPoison json_rpc url 1 #{inspect(url)}")
    Logger.info("HTTPoison json_rpc body json 1 #{inspect(json)}")

    case HTTPoison.post(url, json, headers, options) do
      {:ok, %HTTPoison.Response{body: body, status_code: status_code}} ->
        Logger.info("HTTPoison json_rpc 1 body #{inspect(body)}")
        {:ok, %{body: body, status_code: status_code}}

      {:error, %HTTPoison.Error{reason: reason}} ->
        {:error, reason}
    end
  end

  def json_rpc(url, _json, _headers, _options) when is_nil(url), do: {:error, "URL is nil"}
end
