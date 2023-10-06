defmodule BlockScoutWeb.Plug.SetLocale do
  # 1
  import Plug.Conn
  # 2
  @supported_locales Gettext.known_locales(BlockScoutWeb.Gettext)

  # 3
  def init(_options), do: nil
  #  4
  def call(conn, _options) do
    case fetch_locale_from(conn) do
      nil ->
        conn

      locale ->
        BlockScoutWeb.Gettext |> Gettext.put_locale(locale)
        conn |> put_resp_cookie("locale", locale, max_age: 365 * 24 * 60 * 60)
    end
  end

  # 5
  def call(conn, _options), do: conn

  defp fetch_locale_from(conn) do
    (conn.params["locale"] || conn.cookies["locale"])
    |> check_locale
  end

  defp check_locale(locale) when locale in @supported_locales, do: locale
  defp check_locale(_), do: nil
end
