import {NextRequest, NextResponse} from "next/server";
import {createErrorResponse, getPluginSettingsFromRequest, PluginErrorType} from "@lobehub/chat-plugin-sdk";
import {ExaSearchParams, ExaSearchResponse, Settings} from "@/type";
import axios from "axios";

const EXA_API_URL = 'https://api.exa.ai/search';
// 从环境变量获取验证密钥
const AUTH_KEY = process.env.PLUGIN_AUTH_KEY;

export async function POST(req: NextRequest) {
	try {
		// 获取插件设置
		let settings = getPluginSettingsFromRequest<Settings>(req);
		if (!settings)
			return createErrorResponse(PluginErrorType.PluginSettingsInvalid, {
				message: 'Plugin settings not found.',
			});

		// 验证插件API密钥
		const clientApiKey = settings.PLUGIN_API_KEY;
		if (!clientApiKey) {
			return createErrorResponse(PluginErrorType.PluginSettingsInvalid, {
				message: '未提供插件API密钥。',
			});
		}
		
		// 检查环境变量中是否配置了验证密钥
		if (!AUTH_KEY) {
			console.error('服务器未配置环境变量PLUGIN_AUTH_KEY');
			return NextResponse.json({
				error: '服务器身份验证配置错误'
			}, { status: 500 });
		}
		
		// 检查客户端提供的密钥是否与环境变量中的匹配
		if (clientApiKey !== AUTH_KEY) {
			console.log('无效的API密钥：客户端密钥与服务器不匹配');
			return NextResponse.json({
				error: '无效的API密钥，身份验证失败'
			}, { status: 401 });
		}

		const apiKey = settings.EXA_API_KEY;
		if (!apiKey) {
			return createErrorResponse(PluginErrorType.PluginSettingsInvalid, {
				message: 'EXA API key not found in settings.',
			});
		}

		const body = await req.json();
		const { query } = body;
		
		if (!query) {
			return createErrorResponse(PluginErrorType.PluginSettingsInvalid, {
				message: 'Search query is required.',
			  });
		}

		// 构建搜索参数，从客户端设置中获取参数
		const searchParams: ExaSearchParams = {
			query,
			type: settings.EXA_SEARCH_TYPE || 'keyword', // 使用设置或默认值
			numResults: settings.EXA_SEARCH_NUM_RESULTS ? parseInt(settings.EXA_SEARCH_NUM_RESULTS) : 25, // 将字符串转换为数字
			contents: {
				summary: settings.EXA_SEARCH_SUMMARY !== undefined ? settings.EXA_SEARCH_SUMMARY : true,
				text: settings.EXA_SEARCH_TEXT || false
			}
		};

		// 调用Exa搜索API
		const response = await axios.post(
			EXA_API_URL,
			searchParams,
			{
				headers: {
					'x-api-key': apiKey,
					'Content-Type': 'application/json',
				}
			}
		);

		if (response.status !== 200) {
			if (response.status === 401) {
				return createErrorResponse(PluginErrorType.PluginSettingsInvalid, {
					message: 'Invalid API key.'
				});
			}
			console.error('Failed to search:', response.data);
			return NextResponse.json({
				error: 'Failed to perform search.'
			}, { status: 500 });
		}

		const searchResults: ExaSearchResponse = response.data;
		
		// 构建Markdown格式的响应
		let markdownResponse = `## 搜索结果: "${query}"\n\n`;
		
		if (searchResults.results && searchResults.results.length > 0) {
			searchResults.results.forEach((result, index) => {
				markdownResponse += `### ${index + 1}. [${result.title}](${result.url})\n`;
				
				if (result.publishedDate) {
					markdownResponse += `📅 发布日期: ${result.publishedDate}\n`;
				}
				
				if (result.author) {
					markdownResponse += `✍️ 作者: ${result.author}\n`;
				}
				
				// 添加相关性分数展示
				if (result.score) {
					markdownResponse += `📊 相关度: ${(result.score * 100).toFixed(2)}%\n`;
				}
				
				// 根据设置显示全文或摘要
				
				if (result.summary) {
					markdownResponse += `\n**摘要**:\n\n${result.summary}\n\n`;
				}
				
				if (result.text) {
					markdownResponse += `\n**全文内容**:\n\n${result.text}\n\n`;
				} 

				// 添加高亮内容(如果有)
				if (result.highlights && result.highlights.length > 0) {
					markdownResponse += `\n**关键片段**:\n\n`;
					result.highlights.forEach(highlight => {
						markdownResponse += `> ${highlight}\n`;
					});
					markdownResponse += `\n`;
				}


				
				markdownResponse += `---\n\n`;
			});

			// 添加搜索元数据(如果有)
			if (searchResults.resolvedSearchType) {
				markdownResponse += `搜索类型: ${searchResults.resolvedSearchType}\n`;
			}
		} else {
			markdownResponse += "没有找到相关结果。";
		}

		// 返回搜索结果
		return NextResponse.json({ markdownResponse });
	} catch (error) {
		console.error('Error performing search:', error);
		return NextResponse.json({
			error: 'Failed to perform search.'
		}, { status: 500 });
	}
}