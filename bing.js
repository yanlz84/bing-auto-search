// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.279
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
var default_search_words = ["守护历史记忆 推动世界和平发展", "今晚月全食时间表收好", "朝鲜播出金正恩出席九三阅兵纪录片", "超燃！裸眼3D看受阅空中梯队", "羽毛球价格涨疯 背后推手竟是猪肉", "美国打美国？华盛顿芝加哥都怒了", "上海老太在3套房里囤30吨垃圾", "净网：网警公布3起打击网络谣言案例", "跑腿骑手送鳄鱼 半道发现是活的", "买房2年后发现是“凶宅” 法院判了", "日本首相石破茂决定辞职", "换70万处标识 五角大楼官员心态崩了", "周星驰让房主任教他吵架", "暴雨大暴雨特大暴雨要来了", "800吨鸭肉冒充牛羊肉骗贷调查", "茅台回应“反诈老陈”喊话", "辛芷蕾获奖 张颂文第一时间发朋友圈", "iPhone 17国行预估价5999元起", "多个视频平台被曝“偷时间”", "特朗普：让芝加哥见识战争部的厉害", "长江重庆段水位下降露出600年石佛", "辛芷蕾是被甄子丹团队挖掘的", "2019年阅兵火遍全网的女兵再次受阅", "数百韩国人在美被抓 有人钻管道躲避", "日本或再陷“一年一首相”政局", "辛芷蕾拿影后 VOGUE主编评论区沦陷", "高校回应宿舍床直接钉在墙上", "“美国总统威胁与一美国城市开战”", "直击苏超：苏州vs盐城", "人大党委书记开账号 昵称人大刚子", "12306回应大量私生高铁站围堵男星", "为何会出现“红月亮”", "司机称备胎被偷 网友留言令人感动", "台风“塔巴”将以强热带风暴级登陆", "中国两架运-20飞往阿富汗运送物资", "9年前辛芷蕾咬的是别人的奖杯", "员工瞒10次跳槽经历被辞退 索赔3万", "直击苏超：淮安vs泰州", "湖南一地编制精简16.6%", "新方法可提前发现阿尔茨海默病迹象", "胖东来有了“父婴室”", "渤海两船相撞致人员失联搜救仍进行", "万颗卫星上天难", "罗智强：一定全力让赖清德下台", "网友指辛芷蕾领奖时张颂文挂脸", "中小学生午休躺睡全面普及还远吗", "开学前有高校驿站每天到3万个包裹", "特朗普刚款待李在明 怎么又对韩变脸", "辛芷蕾获奖后发文：感恩所有", "长剑-1000首次亮相意味着什么", "上海地铁最忙线路拆座位引热议"]

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
