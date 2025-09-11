// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.287
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["“一个人遇到好老师是人生的幸运”", "王辰被免去中国工程院副院长职务", "武契奇：塞尔维亚是中国人民第二故乡", "摘下奖章迎接烈士回家", "短剧招“爸妈”日薪5000先花4万培训", "68岁奶奶玩3年滑板化身“追风少女”", "男子背着钓到的79斤鳡鱼在闹市穿行", "35岁抗癌女孩“香香”不幸离世", "万能插线板藏安全隐患 早已被禁用", "24年前几声轰然巨响 永远改变了美国", "婚礼遇上河南暴雨 救援艇变“婚船”", "重庆辟谣“摩托车能上高速”", "成都地铁案二审维持原判：不构成诬陷", "山姆的“大路货”为何越来越多了", "小红书回应被处罚", "男子打板栗左眼扎入19根刺险失明", "中国发现“亚洲锂腰带”", "无语哥被大妈调侃：洋相还得洋人出", "日本男乒澳门赛首轮全部出局", "阿里能撼动美团的“铁王座”吗", "轰炸卡塔尔后 以总理喊话全世界", "中方回应菲方抗议黄岩岛自然保护区", "俩儿子非亲生案当事人：想要个后人", "薛飞3比0淘汰张本智和", "罗永浩吐槽西贝全是预制菜 客服回应", "开学“发型令”引争议 专家发声", "无语哥来中国有新表情包了", "学生想要躺着军训 教官：安排", "中方回应墨西哥计划对中国汽车加税", "钱学森之子：刷题抹杀孩子求知欲", "被美国背叛？卡塔尔首相：我不能直言", "因新华社出图火了的战士找到了", "乃万工作室回应与车澈街头拥抱", "乌方发视频：用无人机袭击一艘俄军舰", "本轮巴以冲突致加沙地带64718人死亡", "李嘉格车澈离婚", "国家卫健委主任再谈健康体重管理", "特朗普就盟友被枪杀发表全国讲话", "黑龙江煤矿矿震 6名被困人员获救", "特朗普盟友曾号召民众买枪持枪", "房产中介高价出售公民个人信息被抓", "暗杀事件频发 美国陷入政治暴力循环", "印尼巴厘岛等地洪灾已致十余人死亡", "女子腿伤就医被陌生狗子瘸腿学步", "辛芷蕾：去拼去争取太爽了", "无底线的老歌翻唱 正在榨干华语乐坛", "云南男子骑鸵鸟上路 跑得比电动车快", "特朗普盟友遭枪杀 拜登奥巴马发声", "外交部敦促菲方停止侵权挑衅", "台男子驾车撞上幼儿园围墙致1死2伤", "甲骨文创始人妻子是34岁沈阳姑娘"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
